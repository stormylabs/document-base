import { Injectable, Logger } from '@nestjs/common';

import { Either, Result, left, right } from 'src/shared/core/Result';

import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import CreateCrawlJobUseCase from '../../jobs/CreateCrawlJob';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import UseCaseError from '@/shared/core/UseCaseError';
import UnexpectedError, {
  UnfinishedJobsError,
  NotFoundError,
} from '@/shared/core/AppError';

type Response = Either<
  Result<UseCaseError>,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CrawlWebsitesByBotUseCase {
  private readonly logger = new Logger(CrawlWebsitesByBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly createCrawlJobUseCase: CreateCrawlJobUseCase,
    private readonly crawlJobService: CrawlJobService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}
  public async exec(
    botId: string,
    urls: string[],
    limit: number,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling websites by bot`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError(Resource.Bot, [botId]));

      const unfinishedCrawlJobs = await this.crawlJobService.findUnfinishedJobs(
        botId,
      );

      const unfinishedDocIndexJobs =
        await this.docIndexJobService.findUnfinishedJobs(botId);

      if (unfinishedCrawlJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
            JobType.WebCrawl,
          ),
        );
      }

      if (unfinishedDocIndexJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedDocIndexJobs.map((job) => job._id),
            JobType.DocIndex,
          ),
        );
      }

      // * remove all documents before start crawling
      await this.botService.removeAllDocuments(botId);
      this.logger.log(`Removed all documents of bot ${botId}`);

      this.logger.log(`Create crawl job`);
      const result = await this.createCrawlJobUseCase.exec({
        botId,
        urls,
        limit,
      });

      if (result.isLeft()) {
        return left(result.value);
      }
      this.logger.log(`Websites are crawled by bot successfully`);
      return right(Result.ok({ ...result.value.getValue() }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
