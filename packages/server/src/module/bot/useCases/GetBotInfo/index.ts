import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  InvalidInputError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { DocumentType } from '@/shared/interfaces/document';
import { encode } from 'gpt-3-encoder';
import { DocIndexJobService } from '@/module/data/services/docIndexJob.service';
import { CrawlJobService } from '@/module/data/services/crawlJob.service';
import { JobStatus } from '@/shared/interfaces';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{
    bot: {
      _id: string;
      name: string;
      documents: {
        _id: string;
        sourceName: string;
        type: DocumentType;
        tokens: number;
      }[];
      createdAt: Date;
      trainJobs: {
        _id: string;
        status: JobStatus;
        createdAt: Date;
      }[];
      crawlJobs: {
        _id: string;
        status: JobStatus;
        createdAt: Date;
      }[];
    };
  }>
>;

@Injectable()
export default class GetBotInfoUseCase {
  private readonly logger = new Logger(GetBotInfoUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly crawlJobService: CrawlJobService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(botId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting bot info`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError('Bot not found'));

      const { documents, _id, name, createdAt } = bot;

      const resultedDocuments = documents.map((doc) => ({
        _id: doc._id,
        sourceName: doc.sourceName,
        type: doc.type,
        tokens: encode(doc.content).length,
      }));

      const crawlJobs = await this.crawlJobService.findAllByBotId(botId);
      const docIndexJobs = await this.docIndexJobService.findAllByBotId(botId);
      const resultedDocIndexJobs = docIndexJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        createdAt: job.createdAt,
      }));
      const resultedCrawlJobs = crawlJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        createdAt: job.createdAt,
      }));

      this.logger.log(`Get bot info successfully`);
      return right(
        Result.ok({
          bot: {
            _id,
            name,
            documents: resultedDocuments,
            createdAt,
            trainJobs: resultedDocIndexJobs,
            crawlJobs: resultedCrawlJobs,
          },
        }),
      );
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
