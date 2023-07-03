import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../../services/bot.service';
import { CreateBotResponseDTO } from './dto';

type Response = Either<UnexpectedError, Result<CreateBotResponseDTO>>;

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
      return left(new UnexpectedError(err));
    }
  }
}
