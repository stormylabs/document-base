import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobService } from '../../services/crawlJob.service';
import { JobStatus } from '@/shared/interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';

type Response = Either<NotFoundError | UnexpectedError, Result<void>>;

@Injectable()
export default class MarkCrawlJobFinishUseCase {
  private readonly logger = new Logger(MarkCrawlJobFinishUseCase.name);
  constructor(private readonly crawlJobService: CrawlJobService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  public async exec(): Promise<Response> {
    try {
      this.logger.log(`Start marking timeout jobs as finished`);

      const timeoutRunningJobs = await this.crawlJobService.findTimeoutJobs(
        JobStatus.Running,
      );

      const timeoutPendingJobs = await this.crawlJobService.findTimeoutJobs(
        JobStatus.Pending,
      );

      const jobs = [...timeoutRunningJobs, ...timeoutPendingJobs];

      if (jobs.length === 0) {
        this.logger.log(`No timeout jobs found`);
        return right(Result.ok());
      }

      for (const job of jobs) {
        await this.crawlJobService.updateStatus(job._id, JobStatus.Finished);
      }

      this.logger.log(`Marked ${jobs.length} jobs as finished`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
