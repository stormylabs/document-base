import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  DocumentNotFoundError,
  UnfinishedCrawlJobsError,
  UnfinishedDocIndexJobsError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import CreateDocIndexJobUseCase from '../../jobs/CreateDocIndexJob';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { SaveDocsAndTrainBotResponseDTO } from './dto';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';

type Response = Either<
  | UnexpectedError
  | BotNotFoundError
  | DocumentNotFoundError
  | UnfinishedDocIndexJobsError
  | UnfinishedCrawlJobsError,
  Result<SaveDocsAndTrainBotResponseDTO>
>;

@Injectable()
export default class SaveDocsAndTrainBotUseCase {
  private readonly logger = new Logger(SaveDocsAndTrainBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
    private readonly createDocIndexJobUseCase: CreateDocIndexJobUseCase,
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(botId: string, documentIds: string[]): Promise<Response> {
    try {
      this.logger.log(`Start saving to bot and indexing documents`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new BotNotFoundError());

      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );
      if (unfinishedCrawlJobs.length > 0) {
        return left(
          new UnfinishedCrawlJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
          ),
        );
      }

      // do we need flag on bot schema for identify is this bot run for crawl or extract jobs
      const unfinishedExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);
      if (unfinishedExtractFileJobs.length > 0) {
        return left(
          new UnfinishedCrawlJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
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

      const docIdsToRemove = bot.documents
        .filter((document) => !documentIdsSet.has(document._id))
        .map((document) => document._id);

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
