import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { JobStatus } from '@/shared/interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<Result<UseCaseError>, Result<void>>;

@Injectable()
export default class MarkJobsAsFinishedUseCase {
  private readonly logger = new Logger(MarkJobsAsFinishedUseCase.name);
  constructor(
    private readonly crawlJobService: CrawlJobService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly extractFileJobService: ExtractFileJobService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
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

      const runningFileExtractJobs =
        await this.extractFileJobService.findTimeoutJobs(JobStatus.Running);

      const pendingFileExtractJobs =
        await this.extractFileJobService.findTimeoutJobs(JobStatus.Pending);

      const totalLength =
        runningCrawlJobs.length +
        pendingCrawlJobs.length +
        runningDocIndexJobs.length +
        pendingDocIndexJobs.length +
        runningFileExtractJobs.length +
        pendingFileExtractJobs.length;

      if (totalLength === 0) {
        this.logger.log(`No timeout jobs found`);
        return right(Result.ok());
      }

      const crawlJobs = [...runningCrawlJobs, ...pendingCrawlJobs];

      for (const job of crawlJobs) {
        await this.crawlJobService.acquireLock(job._id);
        await this.crawlJobService.updateStatus(
          job._id,
          JobStatus.Finished,
          false,
        );
        await this.crawlJobService.releaseLock(job._id);
      }

      const docIndexJobs = [...runningDocIndexJobs, ...pendingDocIndexJobs];

      for (const job of docIndexJobs) {
        await this.docIndexJobService.acquireLock(job._id);
        await this.docIndexJobService.updateStatus(
          job._id,
          JobStatus.Finished,
          false,
        );
        await this.docIndexJobService.releaseLock(job._id);
      }

      const extractFileJobs = [
        ...runningFileExtractJobs,
        ...pendingFileExtractJobs,
      ];

      for (const job of extractFileJobs) {
        await this.extractFileJobService.acquireLock(job._id);
        await this.extractFileJobService.updateStatus(
          job._id,
          JobStatus.Finished,
          false,
        );
        await this.extractFileJobService.releaseLock(job._id);
      }

      this.logger.log(`Marked crawl jobs ${crawlJobs.length} jobs as finished`);
      this.logger.log(
        `Marked doc index jobs ${docIndexJobs.length} jobs as finished`,
      );
      this.logger.log(
        `Marked extract file jobs ${extractFileJobs.length} jobs as finished`,
      );
      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
