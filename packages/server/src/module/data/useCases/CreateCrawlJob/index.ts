import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';
import { CrawlJobService } from '../../services/crawlJob.service';
import { Message } from '@ssut/nestjs-sqs/dist/sqs.types';
import { BotService } from '@/module/bot/services/bot.service';
import { CrawlJobStatus } from '@/shared/interfaces/crawlJob';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{ jobId: string; status: CrawlJobStatus }>
>;

@Injectable()
export default class CreateCrawlJobUseCase {
  private readonly logger = new Logger(CreateCrawlJobUseCase.name);
  constructor(
    private readonly config: ConfigService,
    private readonly sqsService: SqsService,
    private readonly crawlJobService: CrawlJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(
    botId: string,
    urls: string[],
    limit: number,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling website`);

      const botExists = await this.botService.exists(botId);
      if (!botExists) return left(new NotFoundError('Bot not found'));

      const crawlJob = await this.crawlJobService.createCrawlJob(limit, urls);

      const { _id, status } = crawlJob;

      const messages: Message<{ url: string; botId: string }>[] = urls.map(
        (url) => ({
          body: { url, botId },
          id: _id,
        }),
      );

      await this.sqsService.send(this.config.get('SQS_QUEUE_URL'), messages);

      return right(Result.ok({ jobId: _id, status }));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
