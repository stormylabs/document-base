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
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<
  Result<UseCaseError>,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateCrawlJobOrganizationUseCase {
  private readonly logger = new Logger(CreateCrawlJobOrganizationUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly crawlJobOrgService: CrawlJobOrganizationService,
    private readonly organizationService: OrganizationService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(
    organizationId: string,
    urls: string[],
    limit: number,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job organization`);

      const org = await this.organizationService.findById(organizationId);
      if (!org)
        return left(new NotFoundError(Resource.Organization, [organizationId]));

      const urlDocs = org.documents.filter(
        (doc) => doc.type === DocumentType.Url,
      );

      // ? need to verify this flow
      await this.organizationService.removeDocuments(
        organizationId,
        urlDocs.map((doc) => doc._id),
      );

      const crawlJob = await this.crawlJobOrgService.create({
        limit,
        organizationId,
        initUrls: urls,
      });

      const { _id: jobId, status } = crawlJob;

      const payloads = await this.createPayloads(jobId, organizationId, urls);

      const batchSize = 100;

      for (let i = 0; i < payloads.length; i += batchSize) {
        try {
          await this.sendMessages(jobId, payloads.slice(i, i + batchSize));
        } catch (e) {
          return left(new SQSSendMessageError(e));
        }
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log(`Crawl job organization is created successfully`);
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

  async createPayloads(jobId: string, organizationId: string, urls: string[]) {
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

      payloads.push({ organizationId, jobId, documentId });
    }
    return payloads;
  }
}
