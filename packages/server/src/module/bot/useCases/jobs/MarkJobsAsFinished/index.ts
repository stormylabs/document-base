import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { JobStatus } from '@/shared/interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';

type Response = Either<UnexpectedError, Result<void>>;

@Injectable()
export default class MarkJobsAsFinishedUseCase {
  private readonly logger = new Logger(MarkJobsAsFinishedUseCase.name);
  constructor(
    private readonly crawlJobService: CrawlJobService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async exec(): Promise<Response> {
    try {
      this.logger.log(`Start marking timeout jobs as finished`);

      const runningCrawlJobs = await this.crawlJobService.findTimeoutJobs(
        JobStatus.Running,
      );

      const pendingCrawlJobs = await this.crawlJobService.findTimeoutJobs(
        JobStatus.Pending,
      );

      const runningDocIndexJobs = await this.docIndexJobService.findTimeoutJobs(
        JobStatus.Running,
      );

      const pendingDocIndexJobs = await this.docIndexJobService.findTimeoutJobs(
        JobStatus.Pending,
      );

      const totalLength =
        runningCrawlJobs.length +
        pendingCrawlJobs.length +
        runningDocIndexJobs.length +
        pendingDocIndexJobs.length;

      if (totalLength === 0) {
        this.logger.log(`No timeout jobs found`);
        return right(Result.ok());
      }

      const crawlJobs = [...runningCrawlJobs, ...pendingCrawlJobs];

      for (const job of crawlJobs) {
        await this.crawlJobService.updateStatus(job._id, JobStatus.Finished);
      }

      const docIndexJobs = [...runningDocIndexJobs, ...pendingDocIndexJobs];

      for (const job of docIndexJobs) {
        await this.docIndexJobService.updateStatus(job._id, JobStatus.Finished);
      }

      this.logger.log(`Marked crawl jobs ${crawlJobs.length} jobs as finished`);
      this.logger.log(
        `Marked doc index jobs ${docIndexJobs.length} jobs as finished`,
      );
      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
