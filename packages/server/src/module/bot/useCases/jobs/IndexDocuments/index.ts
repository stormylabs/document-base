import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  DocIndexJobNotFoundError,
  DocumentNotFoundError,
  LockedDocIndexJobError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { Document as LCDocument } from 'langchain/document';
import { sliceIntoChunks } from '@/shared/utils/web-utils';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { Vector } from '@pinecone-database/pinecone';
import { JobStatus } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import { LangChainService } from '@/module/langChain/services/langChain.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import {
  LangChainGetVectorsError,
  LangChainSplitDocsError,
} from '@/shared/core/LangChainError';
import { PineconeUpsertError } from '@/shared/core/PineconeError';
import { DocumentService } from '@/module/bot/services/document.service';

type Response = Either<
  | DocIndexJobNotFoundError
  | BotNotFoundError
  | UnexpectedError
  | LangChainSplitDocsError
  | LangChainGetVectorsError
  | PineconeUpsertError,
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
    private readonly documentService: DocumentService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly langChainService: LangChainService,
  ) {}
  public async exec(
    botId: string,
    jobId: string,
    documentId: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start indexing document, locking job: ${jobId}`);
      const lockAcquired = await this.docIndexJobService.acquireLock(jobId);

      if (!lockAcquired) {
        return left(new LockedDocIndexJobError(jobId));
      }

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new DocumentNotFoundError());
      }

      const docIndexJob = await this.docIndexJobService.findById(jobId);
      if (!docIndexJob) {
        return left(new DocIndexJobNotFoundError());
      }
      if (docIndexJob.status === JobStatus.Finished) {
        return right(Result.ok());
      }

      if (docIndexJob.status === JobStatus.Pending) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Running);
      }

      this.logger.log(`Start splitting document: ${document.sourceName}`);

      let docs: LCDocument<Record<string, any>>[];
      try {
        docs = await this.langChainService.splitDocuments([
          new LCDocument({
            pageContent: document.content,
            metadata: {
              botId,
              sourceName: document.sourceName,
            },
          }),
        ]);
      } catch (e) {
        return left(new LangChainSplitDocsError(e));
      }

      this.logger.log(`Split document successfully: ${docs.length} chunks`);

      let vectors: Vector[];
      try {
        vectors = await Promise.all(
          docs.flat().map((doc) =>
            this.langChainService.getVectors(document._id, doc, {
              botId: doc.metadata.botId,
              sourceName: doc.metadata.sourceName,
            }),
          ),
        );
      } catch (e) {
        return left(new LangChainGetVectorsError(e));
      }

      this.logger.log(`Get embeddings successfully: ${vectors.length} vectors`);

      const chunks = sliceIntoChunks(vectors, 10);
      const index = this.pineconeService.index;

      this.logger.log(`Start indexing ${chunks.length} chunks`);

      try {
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
      } catch (e) {
        return left(new PineconeUpsertError(e));
      }

      this.logger.log(`Indexing is done`);

      const updatedJob = await this.docIndexJobService.upsertDocuments(jobId, [
        documentId,
      ]);

      if (updatedJob.documents.length === bot.documents.length) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      this.logger.log(`Document is indexed successfully`);
      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    } finally {
      this.logger.log(`Release lock: ${jobId}`);
      await this.docIndexJobService.releaseLock(jobId);
    }
  }
}
