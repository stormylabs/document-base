import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { BotData } from 'src/shared/interfaces/bot';
import UpdateBotDTO from './dto';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ bot: BotData }>
>;

@Injectable()
export default class UpdateBotUseCase {
  private readonly logger = new Logger(UpdateBotUseCase.name);
  constructor(private readonly botService: BotService) {}

  public async exec(botId: string, botData: UpdateBotDTO): Promise<Response> {
    try {
      this.logger.log(`Start updating bot`);

      const bot = await this.botService.update(botId, botData);

      return right(Result.ok({ bot }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
