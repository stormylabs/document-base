import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { CrawlJobNotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import { JobStatus } from '@/shared/interfaces';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { AbortCrawlJobResponseDTO } from './dto';

type Response = Either<
  UnexpectedError | CrawlJobNotFoundError,
  Result<AbortCrawlJobResponseDTO>
>;

@Injectable()
export default class AbortCrawlJobUseCase {
  private readonly logger = new Logger(AbortCrawlJobUseCase.name);
  constructor(private readonly crawlJobService: CrawlJobService) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job`);

      const crawlJob = await this.crawlJobService.findById(jobId);

      if (!crawlJob) return left(new CrawlJobNotFoundError());

      const updatedCrawlJob = await this.crawlJobService.updateStatus(
        jobId,
        JobStatus.Aborted,
      );

      const {
        documents,
        status,
        limit,
        updatedAt,
        createdAt,
        bot: botId,
      } = updatedCrawlJob;

      this.logger.log(`Update crawl job status to "aborted" successfully`);

      return right(
        Result.ok({
          jobId,
          botId,
          status,
          limit,
          updatedAt,
          createdAt,
          progress: Math.floor((documents.length / limit) * 100),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
