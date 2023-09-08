import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  UnfinishedJobsError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import CreateDocIndexJobUseCase from '../../jobs/CreateDocIndexJob';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { SaveDocsAndTrainBotResponseDTO } from './dto';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { JobType, Resource } from '@/shared/interfaces';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BillableResource } from '@/shared/interfaces/usage';

type Response = Either<
  Result<UseCaseError>,
  Result<SaveDocsAndTrainBotResponseDTO>
>;

@Injectable()
export default class SaveDocsAndTrainBotUseCase {
  private readonly logger = new Logger(SaveDocsAndTrainBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly createDocIndexJobUseCase: CreateDocIndexJobUseCase,
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly resourceUsageService: ResourceUsageService,
  ) {}
  public async exec(
    userId: string,
    botId: string,
    documentIds: string[],
  ): Promise<Response> {
    try {
      this.logger.log(`Start saving to bot and indexing documents`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError(Resource.Bot, [botId]));

      // check unfinished crawl job
      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );
      if (unfinishedCrawlJobs.length > 0) {
        // early return
        return left(
          new UnfinishedJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
            JobType.WebCrawl,
          ),
        );
      }

      // do we need flag on bot schema for identify is this bot run for crawl or extract jobs
      const unfinishedExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);
      if (unfinishedExtractFileJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedExtractFileJobs.map((job) => job._id),
            JobType.FileExtract,
          ),
        );
      }

      // check unfinished doc index job
      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);
      if (unfinishedDocIndexJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedDocIndexJobs.map((job) => job._id),
            JobType.DocIndex,
          ),
        );
      }

      const documentIdsSet = new Set(documentIds);

      const docIdsToRemove = bot.documents
        .filter((document) => !documentIdsSet.has(document._id))
        .map((document) => document._id);

      const docIdsToAdd = documentIds.filter(
        (id) => !bot.documents.map((document) => document._id).includes(id),
      );

      this.logger.log(`Removing documents from bot`);
      await this.botService.removeDocuments(botId, docIdsToRemove);

      this.logger.log(`Upserting documents to bot`);
      const upsertedBot = await this.botService.upsertDocuments(
        botId,
        docIdsToAdd,
      );
      this.logger.log(`Create doc index job`);
      const result = await this.createDocIndexJobUseCase.exec(
        botId,
        upsertedBot.documents,
      );

      if (result.isLeft()) {
        return left(result.value);
      }

      this.logger.log(`Logging training usage`);

      await this.resourceUsageService.onResourceUsed({
        botId,
        userId,
        resource: BillableResource.Training,
      });

      return right(Result.ok({ ...result.value.getValue() }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
