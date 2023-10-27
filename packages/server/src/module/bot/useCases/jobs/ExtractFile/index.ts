import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  ExtractFileError,
  LockedJobError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { ExtractFileJobService } from '../../../services/extractFileJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import { ExtractPDF } from '@/shared/utils/extractPdf';
import { DocumentType } from '@/shared/interfaces/document';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { ExtractWord } from '@/shared/utils/extractWord';
import UseCaseError from '@/shared/core/UseCaseError';
import { BotData } from '@/shared/interfaces/bot';
import { OrganizationData } from '@/shared/interfaces/organization';
import { OrganizationService } from '@/module/organization/services/organization.service';

type Response = Either<Result<UseCaseError>, Result<void>>;

@Injectable()
export default class ExtractFileUseCase {
  private readonly logger = new Logger(ExtractFileUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly documentService: DocumentService,
    private readonly orgService: OrganizationService,
  ) {}
  public async exec({
    botId,
    organizationId,
    documentId,
    jobId,
  }: {
    jobId: string;
    botId?: string;
    organizationId?: string;
    documentId: string;
  }): Promise<Response> {
    try {
      this.logger.log(`Start extract file, locking job: ${jobId}`);

      const lockAcquired = await this.extractFileJobService.acquireLock(jobId);

      if (!lockAcquired) {
        return left(new LockedJobError([jobId], JobType.FileExtract));
      }

      const extractFileJob = await this.extractFileJobService.findById(jobId);
      if (!extractFileJob) {
        return left(new NotFoundError(Resource.ExtractFileJob, [jobId]));
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new NotFoundError(Resource.Document, [documentId]));
      }

      if (
        extractFileJob.status === JobStatus.Finished ||
        extractFileJob.status === JobStatus.Aborted
      ) {
        this.logger.log(`Extract file job is ${extractFileJob.status}`);

        // delete un-extracted documents
        await this.documentService.delete(documentId);
        return right(Result.ok());
      }

      // check is all file extracted
      if (extractFileJob.initUrls.length === extractFileJob.documents.length) {
        await this.extractFileJobService.updateStatus(
          jobId,
          JobStatus.Finished,
        );
        return right(Result.ok());
      }

      if (extractFileJob.status === JobStatus.Pending) {
        await this.extractFileJobService.updateStatus(jobId, JobStatus.Running);
      }

      let result: BotData | OrganizationData = null;

      if (botId) {
        result = await this.botService.findById(botId);
      }

      if (!result) {
        return left(
          new NotFoundError(Resource[botId ? 'Bot' : 'Organization'], [
            botId ? botId : organizationId,
          ]),
        );
      }

      const url = document.sourceName;

      let data: {
        text: string;
      };

      // extract file start
      try {
        if (document.type === DocumentType.Pdf) {
          const extractPdf = new ExtractPDF(url);
          data = (await extractPdf.start()) as {
            text: string;
          };
        } else if (document.type === DocumentType.Word) {
          const extractWord = new ExtractWord(url);

          data = (await extractWord.start()) as {
            text: string;
          };
        }
      } catch (e) {
        // does not soft delete document, show to the user that the file is empty/cant extracted
        await this.extractFileJobService.removeDocument(jobId, documentId);
        this.logger.log(
          'Delete document and remove from extract file job as extraction error',
        );
        return left(new ExtractFileError(e));
      }

      this.logger.log('data extracted');

      // upsert document with extracted file result/content
      await this.documentService.updateContent({
        documentId,
        content: data.text,
        ...(organizationId ? { organizationId } : {}),
      });
      this.logger.log('document content updated');

      if (botId) {
        await this.botService.upsertDocument(botId, documentId);
      }
      const upsertedExtractFileJob =
        await this.extractFileJobService.upsertDocuments(jobId, [documentId]);

      this.logger.log(
        `document upserted to extract file job: ${upsertedExtractFileJob._id}`,
      );

      if (
        upsertedExtractFileJob.documents.length ===
        upsertedExtractFileJob.initUrls.length
      ) {
        this.logger.log('extract file job finished');
        await this.extractFileJobService.updateStatus(
          jobId,
          JobStatus.Finished,
        );
        return right(Result.ok());
      }

      this.logger.log(`File extract successfully`);
      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    } finally {
      this.logger.log(`Release lock: ${jobId}`);
      await this.extractFileJobService.releaseLock(jobId);
    }
  }
}
