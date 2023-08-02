import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { BotService } from '@/module/bot/services/bot.service';
import { ExtractFileJobMessage } from '@/shared/interfaces/extractFileJob';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus } from '@/shared/interfaces';
import { DocumentService } from '@/module/bot/services/document.service';
import { DocumentExtToType } from '@/shared/interfaces/document';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { extractExtensionFromUrl } from '@/shared/utils/web-utils';

type Response = Either<
  UnexpectedError | SQSSendMessageError | BotNotFoundError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateExtractFileJobUseCase {
  private readonly logger = new Logger(CreateExtractFileJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(botId: string, urls: string[]): Promise<Response> {
    try {
      this.logger.log(`Start creating extract files job`);

      const botExists = await this.botService.exists([botId]);
      if (!botExists) return left(new BotNotFoundError());

      const extractFileJob = await this.extractFileJobService.create({
        botId,
        initUrls: urls,
      });

      const { _id: jobId, status } = extractFileJob;

      const payloads = await this.createPayloads(jobId, botId, urls);

      try {
        await this.sendMessages(jobId, payloads);
      } catch (e) {
        return left(new SQSSendMessageError(e));
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      // to keep track of the number of documents sent to the queue
      const documentIds = payloads.map((payload) => payload.documentId);
      await this.extractFileJobService.upsertDocuments(jobId, documentIds);
      this.logger.log('documents upsert to extract file job');

      this.logger.log(`Extract file job is created successfully`);
      return right(Result.ok({ jobId, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: ExtractFileJobMessage[]) {
    await this.sqsMessageService.sendMessages<ExtractFileJobMessage>(
      jobId,
      'file-extract',
      payloads,
    );
  }

  async createPayloads(jobId: string, botId: string, urls: string[]) {
    const payloads: ExtractFileJobMessage[] = [];
    for (const url of urls) {
      const document = await this.documentService.findBySourceName(url);

      let documentId = '';

      if (!document) {
        const fileExt = extractExtensionFromUrl(url);
        const { _id } = await this.documentService.create({
          sourceName: url,
          type: DocumentExtToType[fileExt],
        });
        documentId = _id;
      } else {
        // replace with a document that was extracted before (same URL)
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
