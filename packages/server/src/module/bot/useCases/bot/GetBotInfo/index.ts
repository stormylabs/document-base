import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { encode } from 'gpt-3-encoder';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { GetBotInfoResponseDTO } from './dto';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<GetBotInfoResponseDTO>>;

@Injectable()
export default class GetBotInfoUseCase {
  private readonly logger = new Logger(GetBotInfoUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly crawlJobService: CrawlJobService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly extractFileJobService: ExtractFileJobService,
  ) {}
  public async exec(botId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting bot info`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError(Resource.Bot, [botId]));

      const { documents, _id, name, createdAt, fallbackMessage, prompt, user } =
        bot;

      const resultedDocuments = documents.map((doc) => {
        return {
          _id: doc._id,
          sourceName: doc.sourceName,
          type: doc.type,
          tokens: doc.content ? encode(doc.content).length : 0,
          characters: doc.content ? doc.content.length : 0,
        };
      });

      const crawlJobs = await this.crawlJobService.findAllByBotId(botId);
      const docIndexJobs = await this.docIndexJobService.findAllByBotId(botId);
      const extractFileJobs = await this.extractFileJobService.findAllByBotId(
        botId,
      );
      const resultedDocIndexJobs = docIndexJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        createdAt: job.createdAt,
      }));
      const resultedCrawlJobs = crawlJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        createdAt: job.createdAt,
      }));
      const resultedExtractFileJobs = extractFileJobs.map((job) => ({
        _id: job._id,
        status: job.status,
        createdAt: job.createdAt,
      }));

      this.logger.log(`Get bot info successfully`);
      return right(
        Result.ok({
          bot: {
            _id,
            fallbackMessage,
            prompt,
            name,
            user,
            documents: resultedDocuments,
            createdAt,
            trainJobs: resultedDocIndexJobs,
            crawlJobs: resultedCrawlJobs,
            extractFileJobs: resultedExtractFileJobs,
          },
        }),
      );
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
