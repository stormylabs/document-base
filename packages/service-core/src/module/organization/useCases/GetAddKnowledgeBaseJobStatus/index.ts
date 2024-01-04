import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { GetAddKnowledgeBaseJobStatusResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { JobStatus, Resource } from '@/shared/interfaces';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { AddKnowledgeBaseJobService } from '../../services/addKnowledgeBaseJob.service';
import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { ExtractFileJobData } from '@/shared/interfaces/extractFileJob';

type Response = Either<
  Result<UseCaseError>,
  Result<GetAddKnowledgeBaseJobStatusResponseDTO | null>
>;

@Injectable()
export default class GetAddKnowledgeBaseJobStatusUseCase {
  private readonly logger = new Logger(
    GetAddKnowledgeBaseJobStatusUseCase.name,
  );
  constructor(
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly addKnowledgeBaseJobService: AddKnowledgeBaseJobService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting crawl job : JobStatus.Running`);

      let crawlJob: CrawlJobData = null;
      let extractFileJob: ExtractFileJobData = null;

      const addKnowledgeBaseJob =
        await this.addKnowledgeBaseJobService.findById(jobId);

      if (!addKnowledgeBaseJob) {
        return left(new NotFoundError(Resource.AddKnowledgeBaseJob, [jobId]));
      }

      if (addKnowledgeBaseJob?.crawlJob?._id) {
        crawlJob = await this.crawlJobService.findById(
          addKnowledgeBaseJob.crawlJob._id,
        );

        if (!crawlJob) {
          return left(
            new NotFoundError(Resource.CrawlJob, [
              addKnowledgeBaseJob.crawlJob._id,
            ]),
          );
        }
      }

      if (addKnowledgeBaseJob?.extractFileJob?._id) {
        extractFileJob = await this.extractFileJobService.findById(
          addKnowledgeBaseJob.extractFileJob._id,
        );

        if (!extractFileJob)
          return left(
            new NotFoundError(Resource.ExtractFileJob, [
              addKnowledgeBaseJob.extractFileJob._id,
            ]),
          );
      }

      const jobsStatuses: { crawlJob?: JobStatus; extractFileJob?: JobStatus } =
        {};

      if (crawlJob) {
        jobsStatuses.crawlJob = crawlJob?.status;
      }

      if (extractFileJob) {
        jobsStatuses.extractFileJob = extractFileJob?.status;
      }

      let status: JobStatus;
      if (jobsStatuses?.crawlJob && jobsStatuses?.extractFileJob) {
        if (
          crawlJob.status === JobStatus.Finished &&
          extractFileJob.status === JobStatus.Finished
        ) {
          status = JobStatus.Finished;
        }
        const statuses = [crawlJob.status, extractFileJob.status];

        if (statuses.includes(JobStatus.Failed)) {
          status = JobStatus.Failed;
        }

        if (statuses.includes(JobStatus.Running)) {
          status = JobStatus.Running;
        }

        if (status.includes(JobStatus.Aborted)) {
          status = JobStatus.Aborted;
        }
      } else {
        if (jobsStatuses?.crawlJob) {
          status = jobsStatuses.crawlJob;
        }
        if (jobsStatuses.extractFileJob) {
          status = jobsStatuses.extractFileJob;
        }
      }

      this.logger.log(`Get add knowledge base job successfully`);

      // progress = ((number of crawl job documents x progress) + (number of extract job documents x progress)) / number of total documents
      return right(
        Result.ok({
          jobId,
          status,
          createdAt: addKnowledgeBaseJob.createdAt,
          progress: Math.floor(
            (crawlJob.documents.length * 100 +
              extractFileJob.documents.length * 100) /
              (crawlJob.limit + extractFileJob.initUrls.length),
          ),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
