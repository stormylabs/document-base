import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import UnexpectedError, {
  InvalidInputError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import { JobStatus } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import { DocumentService } from '@/module/bot/services/document.service';
import CreateDocIndexJobUseCase from '../../jobs/CreateDocIndexJob';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class SaveDocsAndTrainBotUseCase {
  private readonly logger = new Logger(SaveDocsAndTrainBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => CreateDocIndexJobUseCase))
    private readonly createDocIndexJobUseCase: CreateDocIndexJobUseCase,
  ) {}
  public async exec(botId: string, documentIds: string[]): Promise<Response> {
    try {
      this.logger.log(`Start saving to bot and indexing documents`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError('Bot not found'));

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
