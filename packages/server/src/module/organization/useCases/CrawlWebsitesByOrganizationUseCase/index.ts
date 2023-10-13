import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  UnfinishedJobsError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { OrganizationService } from '@/module/organization/services/organization.service';
import CreateCrawlJobOrgUseCase from '../jobs/CreateCrawlJob';
import { CrawlJobOrganizationService } from '@/module/organization/services/crawlJob.service';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CrawlWebsitesByOrganizationUseCase {
  private readonly logger = new Logger(CrawlWebsitesByOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly createCrawlJobUseCase: CreateCrawlJobOrgUseCase,
    private readonly crawlJobService: CrawlJobOrganizationService,
  ) {}
  public async exec(
    orgId: string,
    urls: string[],
    only: boolean,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling websites by organization`);

      const org = await this.orgService.findById(orgId);
      if (!org) return left(new NotFoundError(Resource.Organization, [orgId]));

      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        orgId,
      );

      if (unfinishedCrawlJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
            JobType.WebCrawlOrg,
          ),
        );
      }

      // remove all documents before start crawling
      await this.orgService.removeAllDocuments(orgId);
      this.logger.log(`Removed all documents of organization ${orgId}`);

      this.logger.log(`Create crawl job`);
      const result = await this.createCrawlJobUseCase.exec(orgId, urls, only);

      if (result.isLeft()) {
        return left(result.value);
      }
      this.logger.log(`Websites are crawled by organization successfully`);
      return right(Result.ok({ ...result.value.getValue() }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
