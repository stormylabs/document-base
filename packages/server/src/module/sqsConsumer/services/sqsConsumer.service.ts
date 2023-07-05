import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as dotenv from 'dotenv';
import CrawlWebsiteUseCase from '@/module/bot/useCases/jobs/CrawlWebsite';
import { CrawlJobMessage } from '@/shared/interfaces/crawlJob';
import { DocIndexJobMessage } from '@/shared/interfaces/docIndexJob';
import IndexDocumentUseCase from '@/module/bot/useCases/jobs/IndexDocuments';
import { errorHandler } from '@/shared/http';
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
    const body: CrawlJobMessage = JSON.parse(message.Body);
    const { jobId, botId, documentId } = body;
    this.logger.log(`Received web crawl message from SQS`);
    const result = await this.crawlWebsiteUseCase.exec(
      jobId,
      botId,
      documentId,
    );
    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[WebCrawl] web crawl error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
  }

  @SqsMessageHandler(process.env.DOC_INDEX_QUEUE_NAME)
  async handleDocIndexMessage(message: AWS.SQS.Message) {
    const body: DocIndexJobMessage = JSON.parse(message.Body);
    const { jobId, botId, documentId } = body;
    this.logger.log(`Received doc index message from SQS`);
    const result = await this.indexDocumentUseCase.exec(
      botId,
      jobId,
      documentId,
    );
    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[DocIndex] doc index error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
  }

  @SqsConsumerEventHandler(process.env.WEB_CRAWL_QUEUE_NAME, 'error')
  @SqsConsumerEventHandler(process.env.DOC_INDEX_QUEUE_NAME, 'error')
  async handleError(error: Error) {
    this.logger.error(error);
  }
}
