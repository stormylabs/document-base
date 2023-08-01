import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  ExtractFileJobNotFoundError,
  DocumentNotFoundError,
  ExtractFileError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { ExtractFileJobService } from '../../../services/extractFileJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import { ExtractPDF } from '@/shared/utils/extractPdf';
import { DocumentType } from '@/shared/interfaces/document';
import { JobStatus } from '@/shared/interfaces';
import { ExtractWord } from '@/shared/utils/extractWord';

type Response = Either<
  | ExtractFileJobNotFoundError
  | DocumentNotFoundError
  | BotNotFoundError
  | UnexpectedError
  | ExtractFileError,
  Result<void>
>;

@Injectable()
export default class ExtractFileUseCase {
  private readonly logger = new Logger(ExtractFileUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(
    jobId: string,
    botId: string,
    documentId: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start extract file`);

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }
      const extractFileJob = await this.extractFileJobService.findById(jobId);
      if (!extractFileJob) {
        return left(new ExtractFileJobNotFoundError());
      }

      const document = await this.documentService.findById(documentId);
      if (!document) {
        return left(new DocumentNotFoundError());
      }

      if (extractFileJob.status === JobStatus.Finished) {
        this.logger.log('extract file job finished');
        return right(Result.ok());
      }

      if (
        extractFileJob.initUrls.length ===
        bot.documents.filter((doc) => doc.type === DocumentType.Pdf).length
      ) {
        await this.extractFileJobService.updateStatus(
          jobId,
          JobStatus.Finished,
        );
        return right(Result.ok());
      }

      if (extractFileJob.status === JobStatus.Pending) {
        await this.extractFileJobService.updateStatus(jobId, JobStatus.Running);
      }

      const url = document.sourceName;

      let data: {
        text: string;
      };

      // * extract file

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
        await this.extractFileJobService.removeDocument(jobId, documentId);
        this.logger.log(
          'Delete document and remove from extract file job as extraction error',
        );
        return left(new ExtractFileError(e));
      }

      this.logger.log('data extracted');

      // does not soft delete document, show to the user that the file is empty/uncrawlable

      await this.documentService.updateContent(documentId, data.text);
      this.logger.log('document content updated');
      const upsertBot = await this.botService.upsertDocument(botId, documentId);
      this.logger.log('document upsert to bot');

      if (upsertBot.documents.length === extractFileJob.initUrls.length) {
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
    }
  }
}
