import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as dotenv from 'dotenv';
import CrawlWebsiteUseCase from '@/module/bot/useCases/jobs/CrawlWebsite';
import { CrawlJobMessage } from '@/shared/interfaces/crawlJob';
import { DocIndexJobMessage } from '@/shared/interfaces/docIndexJob';
import IndexDocumentUseCase from '@/module/bot/useCases/jobs/IndexDocuments';
dotenv.config();

@Injectable()
export class SqsConsumerService {
  private readonly logger = new Logger(SqsConsumerService.name);
  constructor(
    // forwardRef injects CrawlWebsiteUseCase and dependencies so that nestjs can resolve
    // without specifying all the dependencies in SqsConsumerModule
    @Inject(forwardRef(() => CrawlWebsiteUseCase))
    private readonly crawlWebsiteUseCase: CrawlWebsiteUseCase,
    @Inject(forwardRef(() => IndexDocumentUseCase))
    private readonly indexDocumentUseCase: IndexDocumentUseCase,
  ) {}
  @SqsMessageHandler(process.env.WEB_CRAWL_QUEUE_NAME)
  async handleWebCrawlMessage(message: AWS.SQS.Message) {
    try {
      const body: CrawlJobMessage = JSON.parse(message.Body);
      const { jobId, botId, documentId } = body;
      this.logger.log(
        `Received web crawl message from SQS. jobId: ${jobId} botId: ${botId} documentId: ${documentId}`,
      );
      await this.crawlWebsiteUseCase.exec(jobId, botId, documentId);
    } catch (err) {
      console.log(err);
    }
  }

  @SqsMessageHandler(process.env.DOC_INDEX_QUEUE_NAME)
  async handleDocIndexMessage(message: AWS.SQS.Message) {
    const body: DocIndexJobMessage = JSON.parse(message.Body);
    const { jobId, botId, document } = body;
    this.logger.log(
      `Received doc index message from SQS: ${jobId} ${botId} ${document.sourceName}`,
    );
    try {
      await this.indexDocumentUseCase.exec(botId, jobId, document);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SqsConsumerEventHandler(process.env.WEB_CRAWL_QUEUE_NAME, 'error')
  @SqsConsumerEventHandler(process.env.DOC_INDEX_QUEUE_NAME, 'error')
  async handleError(error: Error) {
    this.logger.error(error);
  }
}
