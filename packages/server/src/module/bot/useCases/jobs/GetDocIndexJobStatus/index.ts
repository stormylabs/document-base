import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { JobStatus } from '@/shared/interfaces';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{
    jobId: string;
    botId: string;
    status: JobStatus;
    createdAt: Date;
    trained: number;
    progress: number;
  }>
>;

@Injectable()
export default class GetDocIndexJobStatusUseCase {
  private readonly logger = new Logger(GetDocIndexJobStatusUseCase.name);
  constructor(
    private readonly docIndexJobService: DocIndexJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting DocIndex job status`);

      const docIndexJob = await this.docIndexJobService.findById(jobId);

      if (!docIndexJob) return left(new NotFoundError('Crawl job not found'));

      const { status, bot: botId, indexed } = docIndexJob;

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new NotFoundError('Bot not found'));

      const { documents } = bot;

      const progress =
        documents.length === 0
          ? 0
          : Math.floor(indexed / documents.length) * 100;

      this.logger.log(`Get DocIndex job successfully`);
      return right(
        Result.ok({
          jobId,
          botId,
          status,
          createdAt: docIndexJob.createdAt,
          trained: indexed,
          progress,
        }),
      );
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
