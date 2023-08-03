import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  DocumentNotFoundError,
  UnfinishedCrawlJobsError,
  UnfinishedDocIndexJobsError,
  UnfinishedExtractFileJobsError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import CreateDocIndexJobUseCase from '@/module/bot/useCases/jobs/CreateDocIndexJob';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { SaveExtractFileDocsAndTrainBotResponseDTO } from './dto';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';

type Response = Either<
  | UnexpectedError
  | BotNotFoundError
  | DocumentNotFoundError
  | UnfinishedDocIndexJobsError
  | UnfinishedCrawlJobsError,
  Result<SaveExtractFileDocsAndTrainBotResponseDTO>
>;

@Injectable()
export default class SaveExtractFileDocsAndTrainBotUseCase {
  private readonly logger = new Logger(
    SaveExtractFileDocsAndTrainBotUseCase.name,
  );
  constructor(
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
    private readonly createDocIndexJobUseCase: CreateDocIndexJobUseCase,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(botId: string, documentIds: string[]): Promise<Response> {
    try {
      this.logger.log(`Start saving to bot and indexing documents`);

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }

      const unfinishedExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);
      if (unfinishedExtractFileJobs.length > 0) {
        return left(
          new UnfinishedExtractFileJobsError(
            unfinishedExtractFileJobs.map((job) => job._id),
          ),
        );
      }

      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);
      if (unfinishedDocIndexJobs.length > 0) {
        return left(
          new UnfinishedDocIndexJobsError(
            unfinishedDocIndexJobs.map((job) => job._id),
          ),
        );
      }

      if (!(await this.documentService.exists(documentIds))) {
        return left(new DocumentNotFoundError());
      }

      const documentIdsSet = new Set(documentIds);

      // filter document ids that requested to remove
      const docIdsToRemove = bot.documents
        .filter((document) => !documentIdsSet.has(document._id))
        .map((document) => document._id);

      // filter document ids that requested to add/index
      const docIdsToAdd = documentIds.filter(
        (id) => !bot.documents.map((document) => document._id).includes(id),
      );

      await this.botService.removeDocuments(botId, docIdsToRemove);

      const upsertedBot = await this.botService.upsertDocuments(
        botId,
        docIdsToAdd,
      );

      const result = await this.createDocIndexJobUseCase.exec(
        botId,
        upsertedBot.documents,
      );

      if (result.isLeft()) {
        return left(result.value);
      }

      return right(Result.ok({ ...result.value.getValue() }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
