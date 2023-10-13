import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  CrawlerError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobOrganizationService } from '../../../services/crawlJob.service';
import { OrganizationService } from '@/module/organization/services/organization.service';
import { DocumentService } from '@/module/bot/services/document.service';
import { Crawler } from '@/shared/utils/crawler';
import { DocumentType } from '@/shared/interfaces/document';
import { JobStatus, Resource } from '@/shared/interfaces';
import CreateCrawlJobOrganizationUseCase from '../CreateCrawlJob';

type Response = Either<
  NotFoundError | UnexpectedError | CrawlerError,
  Result<void>
>;

@Injectable()
export default class CrawlWebsiteOrganizationUseCase {
  private readonly logger = new Logger(CrawlWebsiteOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly crawlJobOrgService: CrawlJobOrganizationService,
    private readonly documentService: DocumentService,
    private readonly createCrawlJobOrgUseCase: CreateCrawlJobOrganizationUseCase,
  ) {}
  public async exec(
    jobId: string,
    orgId: string,
    documentId: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling website by organization`);

      const org = await this.orgService.findById(orgId);
      if (!org) {
        return left(new NotFoundError(Resource.Organization, [orgId]));
      }
      const crawlJob = await this.crawlJobOrgService.findById(jobId);
      if (!crawlJob) {
        return left(new NotFoundError(Resource.CrawlJob, [jobId]));
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new NotFoundError(Resource.Document, [documentId]));
      }

      if (crawlJob.status === JobStatus.Finished) {
        this.logger.log('crawl job finished');
        return right(Result.ok());
      }

      const limit = crawlJob.limit;
      if (
        limit ===
        org.documents.filter((doc) => doc.type === DocumentType.Url).length
      ) {
        await this.crawlJobOrgService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      if (crawlJob.status === JobStatus.Pending) {
        await this.crawlJobOrgService.updateStatus(jobId, JobStatus.Running);
      }

      const url = document.sourceName;
      const crawlJobDocIds = crawlJob.documents;
      const crawler = new Crawler(url, 200, crawlJob.only);

      let data: {
        text: string;
        urls: string[];
      };
      try {
        data = (await crawler.start()) as {
          text: string;
          urls: string[];
        };
      } catch (e) {
        await this.crawlJobOrgService.removeDocument(jobId, documentId);
        await this.documentService.delete(documentId);
        this.logger.log(
          'Delete document and remove from crawl job as crawler error',
        );
        return left(new CrawlerError(e));
      }
      this.logger.log('data crawled');

      if (!data.text) {
        await this.crawlJobOrgService.removeDocument(jobId, documentId);
        await this.documentService.delete(documentId);
        this.logger.log(
          'Delete document and remove from crawl job as no text is found',
        );
        return right(Result.ok());
      }

      await this.documentService.updateContent({
        documentId,
        // title is this needed
        content: data.text,
      });
      this.logger.log('document content updated');
      const upsertedOrg = await this.orgService.upsertDocument(
        orgId,
        documentId,
      );
      this.logger.log('document upserted to org');

      if (upsertedOrg.documents.length === limit) {
        this.logger.log('crawl job finished');
        await this.crawlJobOrgService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      if (crawlJob.only) {
        this.logger.log('only flag is true, no need to crawl other urls');
        return right(Result.ok());
      }

      const orgDocumentUrls = upsertedOrg.documents
        .filter((doc) => doc.type === DocumentType.Url)
        .map((doc) => doc.sourceName);

      //   filters out current org documents.urls to only send new urls
      const urls = data.urls.filter((url) => !orgDocumentUrls.includes(url));
      const numToSend = Math.ceil((limit - crawlJobDocIds.length) * 1.3);
      const urlsToSend = urls.slice(0, numToSend);

      if (urlsToSend.length <= 0) {
        this.logger.log('no new urls to crawl');
        return right(Result.ok());
      }

      const payloads = await this.createCrawlJobOrgUseCase.createPayloads(
        jobId,
        orgId,
        urlsToSend,
      );
      // to keep track of the number of documents sent to the queue
      const documentIds = payloads.map((payload) => payload.documentId);

      await this.crawlJobOrgService.upsertDocuments(jobId, documentIds);

      await this.createCrawlJobOrgUseCase.sendMessages(jobId, payloads);
      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log('documents upserted to crawl job by organization');

      this.logger.log(`Website is crawled successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
