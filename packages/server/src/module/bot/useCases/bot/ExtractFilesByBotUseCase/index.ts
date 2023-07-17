import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { FilesService } from '@/module/files/services/files.service';
import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  InvalidInputError,
  UnfinishedCrawlJobsError,
  UnfinishedDocIndexJobsError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../../services/bot.service';
import CreateExtractFileJobUseCase from '../../jobs/CreateExtractFileJob';
import { ExtractFilesByBotResponseDTO } from './dto';

type Response = Either<UnexpectedError, Result<ExtractFilesByBotResponseDTO>>;

@Injectable()
export default class ExtractFilesByBotUseCase {
  private readonly logger = new Logger(ExtractFilesByBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly fileService: FilesService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly extractFileJobUseCase: CreateExtractFileJobUseCase,
  ) {}
  public async exec(
    botId: string,
    files: Array<Express.Multer.File>,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating bot with file`);

      if (files.length < 0) {
        return left(new InvalidInputError('files is required'));
      }

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }

      const unfinishedCrawlJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);

      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);

      if (unfinishedCrawlJobs.length > 0) {
        return left(
          new UnfinishedCrawlJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
          ),
        );
      }

      if (unfinishedDocIndexJobs.length > 0) {
        return left(
          new UnfinishedDocIndexJobsError(
            unfinishedDocIndexJobs.map((job) => job._id),
          ),
        );
      }

      const uploadFileResults = await Promise.all([
        ...files.map(async (file) => {
          return this.fileService.uploadFile(file.buffer, file.filename);
        }),
      ]);

      // remove all documents before start crawling
      await this.botService.removeAllDocuments(botId);
      this.logger.log(`Removed all documents of bot ${botId}`);

      this.logger.log('Start create extract files jobs');
      const urls = uploadFileResults.map((file) => file.url);

      const result = await this.extractFileJobUseCase.exec(botId, urls);

      if (result.isLeft()) {
        return left(result.value);
      }

      this.logger.log(`Files are extracted by bot successfully`);
      return right(Result.ok({ ...result.value.getValue() }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
