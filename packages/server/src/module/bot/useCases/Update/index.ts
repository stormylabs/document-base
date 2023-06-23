// TODO
import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { BotData } from 'src/shared/interfaces/bot';
import { ObjectId } from 'mongoose';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ bot: BotData }>
>;

@Injectable()
export default class UpdateBotUseCase {
  private readonly logger = new Logger(UpdateBotUseCase.name);
  constructor(private readonly botService: BotService) {}

  public async exec(botId: string, name = 'default'): Promise<Response> {
    try {
      this.logger.log(`Start updating bot`);

      const bot = await this.botService.updateBot(botId, name);

      return right(Result.ok({ bot }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
