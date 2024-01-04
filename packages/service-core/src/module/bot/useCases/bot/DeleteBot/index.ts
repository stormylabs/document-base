import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DeleteBotResponseDTO } from './dto';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { JobStatus, Resource } from '@/shared/interfaces';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { BotUsageService } from '@/module/usage/services/botUsage.service';

type Response = Either<Result<UseCaseError>, Result<DeleteBotResponseDTO>>;

@Injectable()
export default class DeleteBotUseCase {
  private readonly logger = new Logger(DeleteBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly botUsageService: BotUsageService,
  ) {}
  public async exec(botId: string): Promise<Response> {
    try {
      this.logger.log(`Start deleting bot info`);

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new NotFoundError(Resource.Bot, [botId]));
      }

      // check unfinished doc index jobs
      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);

      if (unfinishedDocIndexJobs.length > 0) {
        await this.docIndexJobService.bulkUpdateStatus(
          unfinishedDocIndexJobs.map((job) => job._id),
          JobStatus.Finished,
          false,
        );
      }

      // check unfinished crawl jobs
      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );

      if (unfinishedCrawlJobs.length > 0) {
        await this.crawlJobService.bulkUpdateStatus(
          unfinishedCrawlJobs.map((job) => job._id),
          JobStatus.Finished,
          false,
        );
      }

      // check unfinished extract file jobs
      const unfinishedExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);

      if (unfinishedExtractFileJobs.length > 0) {
        await this.extractFileJobService.bulkUpdateStatus(
          unfinishedExtractFileJobs.map((job) => job._id),
          JobStatus.Finished,
          false,
        );
      }

      await this.botService.delete(botId);

      this.logger.log(`Logging delete bot usage`);
      await this.botUsageService.onBotDeleted(botId);

      this.logger.log(`Delete bot info successfully`);

      return right(
        Result.ok({
          bot,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
