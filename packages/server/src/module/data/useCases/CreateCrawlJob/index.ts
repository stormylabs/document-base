import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { CrawlJobService } from '../../services/crawlJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { CrawlJobMessage, CrawlJobStatus } from '@/shared/interfaces/crawlJob';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{ jobId: string; status: CrawlJobStatus }>
>;

@Injectable()
export default class CreateCrawlJobUseCase {
  private readonly logger = new Logger(CreateCrawlJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly crawlJobService: CrawlJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(
    botId: string,
    urls: string[],
    limit: number,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating crawl job`);

      const botExists = await this.botService.exists(botId);
      if (!botExists) return left(new NotFoundError('Bot not found'));

      // remove all documents before start crawling
      await this.botService.removeAllDocuments(botId);

      const crawlJob = await this.crawlJobService.create(limit, urls);

      const { _id, status } = crawlJob;

      for (const url of urls) {
        await this.sqsMessageService.sendMessage<CrawlJobMessage>(_id, {
          url,
          botId,
          jobId: _id,
        });
      }

      this.logger.log(`Crawl job is created successfully`);
      return right(Result.ok({ jobId: _id, status }));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
