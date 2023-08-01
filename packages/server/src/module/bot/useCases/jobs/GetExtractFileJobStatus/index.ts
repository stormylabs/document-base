import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  ExtractFileJobNotFoundError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import { BotService } from '@/module/bot/services/bot.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { GetExtractFileJobStatusResponseDTO } from './dto';

type Response = Either<
  ExtractFileJobNotFoundError | BotNotFoundError | UnexpectedError,
  Result<GetExtractFileJobStatusResponseDTO>
>;

@Injectable()
export default class GetExtractFileJobStatusUseCase {
  private readonly logger = new Logger(GetExtractFileJobStatusUseCase.name);
  constructor(
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting extract file job status`);

      const extractFileJob = await this.extractFileJobService.findById(jobId);

      if (!extractFileJob) return left(new ExtractFileJobNotFoundError());

      const {
        status,
        bot: botId,
        limit,
        createdAt,
        updatedAt,
      } = extractFileJob;

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new BotNotFoundError());

      const { documents } = bot;

      this.logger.log(`Get extract file job successfully`);
      return right(
        Result.ok({
          jobId,
          botId,
          status,
          createdAt,
          updatedAt,
          limit,
          progress: Math.floor((documents.length / limit) * 100),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
