import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { BotService } from '@/module/bot/services/bot.service';
import { CrawlJobMessage } from '@/shared/interfaces/crawlJob';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus } from '@/shared/interfaces';
import { DocumentService } from '@/module/bot/services/document.service';
import { DocumentType } from '@/shared/interfaces/document';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';

type Response = Either<
  UnexpectedError | SQSSendMessageError | BotNotFoundError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateCrawlJobUseCase {
  private readonly logger = new Logger(CreateCrawlJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly crawlJobService: CrawlJobService,
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(
    botId: string,
    urls: string[],
    limit: number,
    only: boolean,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job`);

      const botExists = await this.botService.exists([botId]);
      if (!botExists) return left(new BotNotFoundError());

      const crawlJob = await this.crawlJobService.create({
        botId,
        limit,
        initUrls: urls,
        only,
      });

      const { _id: jobId, status } = crawlJob;

      const payloads = await this.createPayloads(jobId, botId, urls, only);

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
      await this.crawlJobService.upsertDocuments(jobId, documentIds);
      this.logger.log('documents upserted to crawl job');

      this.logger.log(`Crawl job is created successfully`);
      return right(Result.ok({ jobId, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: CrawlJobMessage[]) {
    await this.sqsMessageService.sendMessages<CrawlJobMessage>(
      jobId,
      'web-crawl',
      payloads,
    );
  }

  async createPayloads(
    jobId: string,
    botId: string,
    urls: string[],
    only?: boolean,
  ) {
    const payloads: CrawlJobMessage[] = [];
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

      payloads.push({ botId, jobId, documentId });
    }
    return payloads;
  }
}
