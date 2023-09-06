import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../../services/bot.service';
import { CreateBotResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { BotUsageService } from '@/module/usage/services/botUsage.service';

type Response = Either<Result<UseCaseError>, Result<CreateBotResponseDTO>>;

@Injectable()
export default class CreateBotUseCase {
  private readonly logger = new Logger(CreateBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly botUsageService: BotUsageService,
  ) {}
  public async exec(name = 'default', userId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating bot`);

      const bot = await this.botService.create(name, userId);

      this.logger.log(`Logging bot usage`);
      await this.botUsageService.onBotCreated({ botId: bot._id, userId });

      this.logger.log(`Created bot successfully`);
      return right(Result.ok({ bot }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
