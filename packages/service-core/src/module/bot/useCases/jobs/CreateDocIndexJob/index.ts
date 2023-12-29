import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { DocumentData } from '@/shared/interfaces/document';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { DocIndexJobMessage } from '@/shared/interfaces/docIndexJob';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { PineconeDeleteError } from '@/shared/core/PineconeError';
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<
  Result<UseCaseError>,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateDocIndexJobUseCase {
  private readonly logger = new Logger(CreateDocIndexJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly botService: BotService,
    private readonly pineconeService: PineconeClientService,
    private readonly docIndexJobService: DocIndexJobService
  ) {}
  public async exec(
    botId: string,
    documents: DocumentData[]
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating doc index job`);

      const botExists = await this.botService.exists([botId]);
      if (!botExists) return left(new NotFoundError(Resource.Bot, [botId]));

      const index = this.pineconeService.index;

      try {
        await index._delete({
          deleteRequest: {
            filter: {
              botId,
            },
          },
        });
      } catch (e) {
        return left(new PineconeDeleteError(e));
      }

      const docIndexJob = await this.docIndexJobService.create(botId);

      const { _id, status } = docIndexJob;

      const payloads = this.createPayloads(_id, botId, documents);

      const batchSize = 100;

      for (let i = 0; i < payloads.length; i += batchSize) {
        try {
          await this.sendMessages(_id, payloads.slice(i, i + batchSize));
        } catch (e) {
          return left(new SQSSendMessageError(e));
        }
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log(`Doc indexing job is created successfully`);
      return right(Result.ok({ jobId: _id, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: DocIndexJobMessage[]) {
    await this.sqsMessageService.sendMessages<DocIndexJobMessage>(
      jobId,
      JobType.DocIndex,
      payloads
    );
  }

  createPayloads(jobId: string, botId: string, documents: DocumentData[]) {
    return documents.map((document) => ({
      botId,
      jobId,
      documentId: document._id,
    }));
  }
}
