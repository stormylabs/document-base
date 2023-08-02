import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  CrawlJobNotFoundError,
  CrawlerError,
  DocumentNotFoundError,
  LockedCrawlJobError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobService } from '../../../services/crawlJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import { Crawler } from '@/shared/utils/crawler';
import { DocumentType } from '@/shared/interfaces/document';
import { JobStatus } from '@/shared/interfaces';
import CreateCrawlJobUseCase from '../CreateCrawlJob';

type Response = Either<
  | CrawlJobNotFoundError
  | DocumentNotFoundError
  | BotNotFoundError
  | UnexpectedError
  | LockedCrawlJobError
  | CrawlerError,
  Result<void>
>;

@Injectable()
export default class CrawlWebsiteUseCase {
  private readonly logger = new Logger(CrawlWebsiteUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly crawlJobService: CrawlJobService,
    private readonly documentService: DocumentService,
    private readonly createCrawlJobUseCase: CreateCrawlJobUseCase,
  ) {}
  public async exec(
    jobId: string,
    botId: string,
    documentId: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling website, locking job: ${jobId}`);
      const lockAcquired = await this.crawlJobService.acquireLock(jobId);

      if (!lockAcquired) {
        return left(new LockedCrawlJobError(jobId));
      }
      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }
      const crawlJob = await this.crawlJobService.findById(jobId);
      if (!crawlJob) {
        return left(new CrawlJobNotFoundError());
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new DocumentNotFoundError());
      }

      if (crawlJob.status === JobStatus.Finished) {
        this.logger.log('crawl job finished');
        // delete uncrawled documents
        await this.documentService.delete(documentId);
        return right(Result.ok());
      }

      if (crawlJob.limit === crawlJob.documents.length) {
        await this.crawlJobService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      if (crawlJob.status === JobStatus.Pending) {
        await this.crawlJobService.updateStatus(jobId, JobStatus.Running);
      }

      const url = document.sourceName;
      const limit = crawlJob.limit;
      const crawler = new Crawler(url);

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
        await this.crawlJobService.removeDocument(jobId, documentId);
        await this.documentService.delete(documentId);
        this.logger.log(
          'Delete document and remove from crawl job as crawler error',
        );
        return left(new CrawlerError(e));
      }
      this.logger.log('data crawled');

      if (!data.text) {
        await this.crawlJobService.removeDocument(jobId, documentId);
        await this.documentService.delete(documentId);
        this.logger.log(
          'Delete document and remove from crawl job as no text is found',
        );
        return right(Result.ok());
      }

      await this.documentService.updateContent(documentId, data.text);
      this.logger.log('document content updated');
      const upsertedBot = await this.botService.upsertDocument(
        botId,
        documentId,
      );
      const upsertedCrawlJob = await this.crawlJobService.upsertDocuments(
        jobId,
        [documentId],
      );
      this.logger.log('document upserted to bot and crawl job');

      if (upsertedCrawlJob.documents.length === limit) {
        this.logger.log('crawl job finished');
        await this.crawlJobService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      const botDocumentUrls = upsertedBot.documents
        .filter((doc) => doc.type === DocumentType.Url)
        .map((doc) => doc.sourceName);

      //   filters out current bot documents.urls to only send new urls
      const urls = data.urls.filter((url) => !botDocumentUrls.includes(url));
      const numToSend = Math.ceil(
        (limit - upsertedCrawlJob.documents.length) * 1.3,
      );
      const urlsToSend = urls.slice(0, numToSend);

      if (urlsToSend.length <= 0) {
        this.logger.log('no new urls to crawl');
        return right(Result.ok());
      }

      const payloads = await this.createCrawlJobUseCase.createPayloads(
        jobId,
        botId,
        urlsToSend,
      );

      await this.createCrawlJobUseCase.sendMessages(jobId, payloads);
      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log('documents upserted to crawl job');

      this.logger.log(`Website is crawled successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    } finally {
      this.logger.log(`Release lock: ${jobId}`);
      await this.crawlJobService.releaseLock(jobId);
    }
  }
}
