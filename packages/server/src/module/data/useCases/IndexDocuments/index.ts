import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { Document as LCDocument } from 'langchain/document';
import {
  sliceIntoChunks,
  truncateStringByBytes,
} from '@/shared/utils/web-utils';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { Vector } from '@pinecone-database/pinecone';
import { JobStatus } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '../../services/docIndexJob.service';
import { LangChainService } from '@/module/langChain/services/langChain.service';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{
    jobId: string;
    botId: string;
    status: JobStatus;
    createdAt: Date;
    limit: number;
    progress: number;
  }>
>;

@Injectable()
export default class IndexDocumentUseCase {
  private readonly logger = new Logger(IndexDocumentUseCase.name);
  constructor(
    private readonly pineconeService: PineconeClientService,
    private readonly botService: BotService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly langChainService: LangChainService,
  ) {}
  public async exec(
    botId: string,
    jobId: string,
    document: { _id: string; sourceName: string; content: string },
  ): Promise<Response> {
    try {
      this.logger.log(`Start indexing document`);

      const bot = await this.botService.findById(botId);

      if (!bot) {
        return left(new NotFoundError('Bot not found'));
      }
      const docIndexJob = await this.docIndexJobService.findById(jobId);
      if (!docIndexJob) {
        return left(new NotFoundError('DocIndexJob not found'));
      }
      if (docIndexJob.status === JobStatus.Finished) {
        return right(Result.ok());
      }

      if (docIndexJob.indexedCount === bot.documents.length) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      if (docIndexJob.status === JobStatus.Pending) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Running);
      }

      this.logger.log('Start splitting document');

      const docs = await this.langChainService.splitDocuments([
        new LCDocument({
          pageContent: document.content,
          metadata: {
            botId,
            sourceName: document.sourceName,
            text: truncateStringByBytes(document.content, 36000),
          },
        }),
      ]);

      this.logger.log(`Split document successfully: ${docs.length} chunks`);

      const vectors = await Promise.all(
        docs.flat().map((doc) =>
          this.langChainService.getVector(document._id, doc, {
            botId: doc.metadata.botId,
            sourceName: doc.metadata.sourceName,
            text: doc.metadata.text,
          }),
        ),
      );

      this.logger.log(`Get embeddings successfully: ${vectors.length} vectors`);

      const chunks = sliceIntoChunks(vectors, 10);
      const index = this.pineconeService.index;

      this.logger.log(`Start indexing ${chunks.length} chunks`);

      await Promise.all(
        chunks.map((chunk) =>
          index.upsert({
            upsertRequest: {
              vectors: chunk as Vector[],
              namespace: '',
            },
          }),
        ),
      );

      this.logger.log(`Indexing is done`);
      await this.docIndexJobService.incrementIndexedCount(jobId);

      this.logger.log(`Document is indexed successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
