import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { BotService } from '@/module/bot/services/bot.service';
import { CrawlJobMessage } from '@/shared/interfaces/crawlJob';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { DocumentService } from '@/module/bot/services/document.service';
import { DocumentType } from '@/shared/interfaces/document';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<
  Result<UseCaseError>,
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
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError(Resource.Bot, [botId]));

      const urlDocs = bot.documents.filter(
        (doc) => doc.type === DocumentType.Url,
      );

      await this.botService.removeDocuments(
        botId,
        urlDocs.map((doc) => doc._id),
      );

      const crawlJob = await this.crawlJobService.create({
        botId,
        limit,
        initUrls: urls,
      });

      const { _id: jobId, status } = crawlJob;

      const payloads = await this.createPayloads(jobId, botId, urls);

      const batchSize = 100;

      for (let i = 0; i < payloads.length; i += batchSize) {
        try {
          await this.sendMessages(jobId, payloads.slice(i, i + batchSize));
        } catch (e) {
          return left(new SQSSendMessageError(e));
        }
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log(`Crawl job is created successfully`);
      return right(Result.ok({ jobId, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: CrawlJobMessage[]) {
    await this.sqsMessageService.sendMessages<CrawlJobMessage>(
      jobId,
      JobType.WebCrawl,
      payloads,
    );
  }

  async createPayloads(jobId: string, botId: string, urls: string[]) {
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
