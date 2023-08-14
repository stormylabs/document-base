import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { BotNotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DeleteBotResponseDTO } from './dto';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { JobStatus } from '@/shared/interfaces';

type Response = Either<
  UnexpectedError | BotNotFoundError,
  Result<DeleteBotResponseDTO>
>;

@Injectable()
export default class DeleteBotUseCase {
  private readonly logger = new Logger(DeleteBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
  ) {}
  public async exec(botId: string): Promise<Response> {
    try {
      this.logger.log(`Start deleting bot info`);

      const bot = await this.botService.findById(botId);
      if (!bot) {
        return left(new BotNotFoundError());
      }

      // check unfinished crawl jobs
      const findCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );
      if (findCrawlJobs.length > 0) {
        await this.crawlJobService.updateUnfinishedJobByBotId(
          botId,
          JobStatus.Finished,
        );
      }

      // check unfinished extract file jobs
      const checkExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobs(botId);
      if (checkExtractFileJobs.length > 0) {
        await this.extractFileJobService.updateUnfinishedJobByBotId(
          botId,
          JobStatus.Finished,
        );
      }

      await this.botService.delete(botId);

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
