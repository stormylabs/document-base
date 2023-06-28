import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobService } from '../../services/crawlJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from '@/module/bot/services/document.service';
import { Crawler } from '@/shared/utils/crawler';
import { DocumentType } from '@/shared/interfaces/document';
import { CrawlJobMessage, CrawlJobStatus } from '@/shared/interfaces/crawlJob';

type Response = Either<NotFoundError | UnexpectedError, Result<void>>;

@Injectable()
export default class CrawlWebsiteUseCase {
  private readonly logger = new Logger(CrawlWebsiteUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly botService: BotService,
    private readonly pineconeService: PineconeClientService,
    private readonly configService: ConfigService,
    private readonly crawlJobService: CrawlJobService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(
    jobId: string,
    botId: string,
    url: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling website`);

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new NotFoundError('Bot not found'));
      }
      const crawlJob = await this.crawlJobService.findById(jobId);
      if (!crawlJob) {
        return left(new NotFoundError('CrawlJob not found'));
      }
      if (crawlJob.status === CrawlJobStatus.Finished) {
        return right(Result.ok());
      }
      if (
        crawlJob.limit ===
        bot.documents.filter((doc) => doc.type === DocumentType.Url).length
      ) {
        await this.crawlJobService.updateStatus(jobId, CrawlJobStatus.Finished);
        return right(Result.ok());
      }
      if (crawlJob.status === CrawlJobStatus.Pending) {
        await this.crawlJobService.updateStatus(jobId, CrawlJobStatus.Running);
      }

      const crawler = new Crawler(url);
      this.logger.log('crawler started');
      const data = (await crawler.start()) as {
        text: string;
        urls: string[];
      };

      const document = await this.documentService.findByName(url);
      let documentId = '';

      if (document) {
        this.logger.log('Document exists');
        documentId = document._id;
      } else {
        this.logger.log('Document does not exist');
        const created = await this.documentService.create({
          name: url,
          type: DocumentType.Url,
          content: data.text,
        });
        documentId = created._id;
      }

      const upsertedBot = await this.botService.upsertDocument(
        botId,
        documentId,
      );

      const botDocumentUrls = upsertedBot.documents
        .filter((doc) => doc.type === DocumentType.Url)
        .map((doc) => doc.name);

      const updatedCrawlJob = await this.crawlJobService.incrementLimit(jobId);
      this.logger.log('crawl job incremented');

      //   set crawl job status to finished if limit is reached
      if (updatedCrawlJob.limit === botDocumentUrls.length) {
        this.logger.log('crawl job finished');
        await this.crawlJobService.updateStatus(jobId, CrawlJobStatus.Finished);
        return right(Result.ok());
      }

      //   filters out current bot documents.urls to only send new urls
      //   and send 50% more urls than limit to make sure that there are enough urls to crawl
      //   only limits to send remaining quotas to limit
      const remaining = Math.floor(
        (updatedCrawlJob.limit - botDocumentUrls.length) * 1.5,
      );
      const urls = data.urls
        .slice(0, remaining)
        .filter((url) => !botDocumentUrls.includes(url));

      for (const url of urls) {
        this.logger.log('sending crawl job message');
        await this.sqsMessageService.sendMessage<CrawlJobMessage>(jobId, {
          url,
          botId,
          jobId,
        });
      }

      this.logger.log(`Website is crawled successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }

  async crawlWebsite() {
    const { status } = await this.pineconeService.client.describeIndex({
      indexName: this.configService.get<string>('PINECONE_INDEX'),
    });
    if (!status.ready) {
      throw new Error('Pinecone index is not ready');
    }
  }
}
