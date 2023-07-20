import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  BotNotFoundError,
  DocIndexJobNotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { GetDocIndexJobStatusResponseDTO } from './dto';

type Response = Either<
  DocIndexJobNotFoundError | UnexpectedError | BotNotFoundError,
  Result<GetDocIndexJobStatusResponseDTO>
>;

@Injectable()
export default class GetDocIndexJobStatusUseCase {
  private readonly logger = new Logger(GetDocIndexJobStatusUseCase.name);
  constructor(
    private readonly docIndexJobService: DocIndexJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting DocIndex job status`);

      const docIndexJob = await this.docIndexJobService.findById(jobId);

      if (!docIndexJob) return left(new DocIndexJobNotFoundError());

      const { status, bot: botId, indexed, createdAt, updatedAt } = docIndexJob;

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new BotNotFoundError());

      const { documents } = bot;

      const progress =
        documents.length === 0
          ? 0
          : Math.floor((indexed / documents.length) * 100);

      this.logger.log(`Get DocIndex job successfully`);
      return right(
        Result.ok({
          jobId,
          botId,
          status,
          createdAt,
          updatedAt,
          trained: indexed,
          progress,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
