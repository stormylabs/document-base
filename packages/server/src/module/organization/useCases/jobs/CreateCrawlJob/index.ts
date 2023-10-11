import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { OrganizationService } from '@/module/organization/services/organization.service';
import { CrawlJobOrgMessage } from '@/shared/interfaces/crawlJobOrganization';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { DocumentService } from '@/module/bot/services/document.service';
import { DocumentType } from '@/shared/interfaces/document';
import { CrawlJobOrganizationService } from '@/module/organization/services/crawlJob.service';

type Response = Either<
  UnexpectedError | SQSSendMessageError | NotFoundError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateCrawlJobOrganizationUseCase {
  private readonly logger = new Logger(CreateCrawlJobOrganizationUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly crawlJobOrgService: CrawlJobOrganizationService,
    private readonly orgService: OrganizationService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(
    orgId: string,
    urls: string[],
    limitValue: number,
    only: boolean,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job`);

      const botExists = await this.orgService.exists([orgId]);
      if (!botExists)
        return left(new NotFoundError(Resource.Organization, [orgId]));

      // if only is true, set limit to the number of urls
      const limit = only ? urls.length : limitValue;

      const crawlJob = await this.crawlJobOrgService.create({
        organizationId: orgId,
        limit,
        initUrls: urls,
        only,
      });

      const { _id: jobId, status } = crawlJob;

      const payloads = await this.createPayloads(jobId, orgId, urls);

      const batchSize = 100;

      for (let i = 0; i < payloads.length; i += batchSize) {
        try {
          await this.sendMessages(jobId, payloads.slice(i, i + batchSize));
        } catch (e) {
          return left(new SQSSendMessageError(e));
        }
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      // to keep track of the number of documents sent to the queue
      const documentIds = payloads.map((payload) => payload.documentId);
      await this.crawlJobOrgService.upsertDocuments(jobId, documentIds);
      this.logger.log('documents upserted to crawl job');

      this.logger.log(`Crawl job is created successfully`);
      return right(Result.ok({ jobId, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: CrawlJobOrgMessage[]) {
    await this.sqsMessageService.sendMessages<CrawlJobOrgMessage>(
      jobId,
      JobType.WebCrawlOrg,
      payloads,
    );
  }

  async createPayloads(jobId: string, orgId: string, urls: string[]) {
    const payloads: CrawlJobOrgMessage[] = [];
    for (const url of urls) {
      const document = await this.documentService.findBySourceName(url);

      let documentId = '';

      if (!document) {
        const { _id } = await this.documentService.create({
          sourceName: url,
          type: DocumentType.Url,
        });
        documentId = _id;
      } else {
        documentId = document._id;
        if (document.deletedAt) {
          await this.documentService.restore(document._id);
        }
      }

      payloads.push({ organizationId: orgId, jobId, documentId });
    }
    return payloads;
  }
}
