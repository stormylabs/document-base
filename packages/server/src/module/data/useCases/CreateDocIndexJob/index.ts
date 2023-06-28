import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus } from '@/shared/interfaces';
import { DocumentData } from '@/shared/interfaces/document';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { DocIndexJobService } from '../../services/docIndexJob.service';
import { DocIndexJobMessage } from '@/shared/interfaces/docIndexJob';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateDocIndexJobUseCase {
  private readonly logger = new Logger(CreateDocIndexJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly botService: BotService,
    private readonly pineconeService: PineconeClientService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(
    botId: string,
    documents: DocumentData[],
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating doc index job`);

      const botExists = await this.botService.exists([botId]);
      if (!botExists) return left(new NotFoundError('Bot not found'));

      const index = this.pineconeService.index;

      await index._delete({
        deleteRequest: {
          filter: {
            botId,
          },
        },
      });

      const docIndexJob = await this.docIndexJobService.create(botId);

      const { _id, status } = docIndexJob;

      for (const document of documents) {
        await this.sqsMessageService.sendMessage<DocIndexJobMessage>(
          _id,
          'doc-index',
          {
            botId,
            jobId: _id,
            document: {
              _id: document._id,
              sourceName: document.sourceName,
              content: document.content,
            },
          },
        );
      }

      this.logger.log(`Doc indexing job is created successfully`);
      return right(Result.ok({ jobId: _id, status }));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
