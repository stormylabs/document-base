import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  InvalidInputError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import CreateDocIndexJobUseCase from '../../jobs/CreateDocIndexJob';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { SaveDocsAndTrainBotResponseDTO } from './dto';

type Response = Either<
  InvalidInputError | UnexpectedError,
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
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(botId: string, documentIds: string[]): Promise<Response> {
    try {
      this.logger.log(`Start saving to bot and indexing documents`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError('Bot not found'));

      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );
      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);

      if ([...unfinishedCrawlJobs, ...unfinishedDocIndexJobs].length > 0) {
        return left(
          new InvalidInputError(
            'There are unfinished jobs. Please wait until they are finished',
          ),
        );
      }

      if (!(await this.documentService.exists(documentIds))) {
        return left(new NotFoundError('Contains documents that are not found'));
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
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
