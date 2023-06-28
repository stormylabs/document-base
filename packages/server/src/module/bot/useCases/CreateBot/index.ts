// TODO
import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { BotData } from 'src/shared/interfaces/bot';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ bot: BotData }>
>;

@Injectable()
export default class CreateBotUseCase {
  private readonly logger = new Logger(CreateBotUseCase.name);
  constructor(private readonly botService: BotService) {}
  public async exec(name = 'default'): Promise<Response> {
    try {
      this.logger.log(`Start creating bot`);

      const bot = await this.botService.create(name);

      return right(Result.ok({ bot }));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
