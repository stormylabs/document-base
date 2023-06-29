import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobService } from '../../services/crawlJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { JobStatus } from '@/shared/interfaces';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{
    jobId: string;
    botId: string;
    status: JobStatus;
    createdAt: Date;
    limit: number;
    progress: number;
  }>
>;

@Injectable()
export default class GetCrawlJobStatusUseCase {
  private readonly logger = new Logger(GetCrawlJobStatusUseCase.name);
  constructor(
    private readonly crawlJobService: CrawlJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting crawl job status`);

      const crawlJob = await this.crawlJobService.findById(jobId);

      if (!crawlJob) return left(new NotFoundError('Crawl job not found'));

      const { status, botId, limit } = crawlJob;

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new NotFoundError('Bot not found'));

      const { documents } = bot;

      this.logger.log(`Get crawl job successfully`);
      return right(
        Result.ok({
          jobId,
          botId,
          status,
          createdAt: crawlJob.createdAt,
          limit,
          progress: Math.floor((documents.length / limit) * 100),
        }),
      );
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
