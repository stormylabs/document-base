import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  LockedJobError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { Document as LCDocument } from 'langchain/document';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import { LangChainService } from '@/module/langChain/services/langChain.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { LangChainSplitDocsError } from '@/shared/core/LangChainError';
import { DocumentService } from '@/module/bot/services/document.service';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<
  Result<UseCaseError>,
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
        return left(new LockedJobError([jobId], JobType.DocIndex));
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new NotFoundError(Resource.Document, [jobId]));
      }

      const docIndexJob = await this.docIndexJobService.findById(jobId);
      if (!docIndexJob) {
        return left(new NotFoundError(Resource.DocIndexJob, [jobId]));
      }

      if (
        docIndexJob.status === JobStatus.Finished ||
        docIndexJob.status === JobStatus.Aborted
      ) {
        this.logger.log(`Doc Index job is ${docIndexJob.status}`);
        return right(Result.ok());
      }

      if (docIndexJob.status === JobStatus.Pending) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Running);
      }

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new NotFoundError(Resource.Bot, [botId]));
      }

      this.logger.log(`Start splitting document: ${document.sourceName}`);

      let docs: LCDocument<Record<string, any>>[];
      try {
        docs = await this.langChainService.splitDocuments(
          [
            new LCDocument({
              pageContent: document.content,
              metadata: {
                botId,
                sourceName: document.sourceName,
              },
            }),
          ],
          document.title,
          document.sourceName,
        );
      } catch (e) {
        return left(new LangChainSplitDocsError(e));
      }

      this.logger.log(`Split document successfully: ${docs.length} chunks`);

      await PineconeStore.fromDocuments(docs, this.langChainService.embedder, {
        pineconeIndex: this.pineconeService.index,
      });

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
