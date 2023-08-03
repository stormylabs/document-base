import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { S3Service } from '@/module/s3/services/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  InvalidInputError,
  S3UploadError,
  UnfinishedDocIndexJobsError,
  UnfinishedExtractFileJobsError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import CreateExtractFileJobUseCase from '@/module/bot/useCases/jobs/CreateExtractFileJob';
import { ExtractFilesByBotResponseDTO } from './dto';
import { ConfigService } from '@nestjs/config';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';

type Response = Either<UnexpectedError, Result<ExtractFilesByBotResponseDTO>>;

@Injectable()
export default class ExtractFilesByBotUseCase {
  private readonly logger = new Logger(ExtractFilesByBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly s3Service: S3Service,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly extractFileJobUseCase: CreateExtractFileJobUseCase,
    private readonly configService: ConfigService,
    private readonly extractFileJobService: ExtractFileJobService,
  ) {}
  public async exec(
    botId: string,
    files: Array<Express.Multer.File>,
  ): Promise<Response> {
    this.logger.log(`Start extracting files by bot`);

    if (!files.length) {
      return left(new InvalidInputError('Files are required'));
    }

    const bot = await this.botService.findById(botId);
    if (!bot) {
      return left(new BotNotFoundError());
    }

    const unfinishedExtractFileJobs =
      await this.extractFileJobService.findUnfinishedJobs(botId);
    if (unfinishedExtractFileJobs.length > 0) {
      return left(
        new UnfinishedExtractFileJobsError(
          unfinishedExtractFileJobs.map((job) => job._id),
        ),
      );
    }

    const unfinishedDocIndexJobs =
      await this.docIndexJobService.findUnfinishedJobs(botId);
    if (unfinishedDocIndexJobs.length > 0) {
      return left(
        new UnfinishedDocIndexJobsError(
          unfinishedDocIndexJobs.map((job) => job._id),
        ),
      );
    }

    let urls: string[] = [];

    const filenames = files.map((file) => file.originalname);

    try {
      urls = await Promise.all([
        ...files.map((file) => {
          return this.s3Service.uploadFile(
            `${bot._id}/${file.originalname}`,
            this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
            file.buffer,
          );
        }),
      ]);
    } catch (e) {
      return left(new S3UploadError(filenames));
    }

    this.logger.log('Start create extract files jobs');
    let result: Response;

    try {
      result = await this.extractFileJobUseCase.exec(botId, urls);

      if (result.isLeft()) {
        return left(result.value);
      }
    } catch (e) {
      return left(new UnexpectedError(e));
    }

    this.logger.log(`Files are extracted by bot successfully`);
    return right(Result.ok({ ...result.value.getValue() }));
  }
}
