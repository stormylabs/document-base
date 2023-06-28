import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as dotenv from 'dotenv';
import CrawlWebsiteUseCase from '@/module/data/useCases/CrawlWebsite';
import { CrawlJobMessage } from '@/shared/interfaces/crawlJob';
dotenv.config();

@Injectable()
export class SqsConsumerService {
  private readonly logger = new Logger(SqsConsumerService.name);
  constructor(
    // forwardRef injects CrawlWebsiteUseCase and dependencies so that nestjs can resolve
    // without specifying all the dependencies in SqsConsumerModule
    @Inject(forwardRef(() => CrawlWebsiteUseCase))
    private readonly crawlWebsiteUseCase: CrawlWebsiteUseCase,
  ) {}
  @SqsMessageHandler(process.env.SQS_QUEUE_NAME)
  async handleMessage(message: AWS.SQS.Message) {
    const body: CrawlJobMessage = JSON.parse(message.Body);
    const { jobId, botId, url } = body;
    this.logger.log(`Received message from SQS: ${jobId} ${botId} ${url}`);
    await this.crawlWebsiteUseCase.exec(jobId, botId, url);
  }

  @SqsConsumerEventHandler(process.env.SQS_QUEUE_NAME, 'error')
  async handleError(error: Error) {
    this.logger.error(error);
  }
}
