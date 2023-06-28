import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { BotData } from 'src/shared/interfaces/bot';
import UpdateBotInfoDTO from './dto';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{
    bot: {
      documents: string[];
      _id: string;
      name: string;
      crawlJobId: string;
      createdAt: Date;
      deletedAt: Date;
    };
  }>
>;

@Injectable()
export default class UpdateBotUseCase {
  private readonly logger = new Logger(UpdateBotUseCase.name);
  constructor(private readonly botService: BotService) {}

  public async exec(
    botId: string,
    botData: UpdateBotInfoDTO,
  ): Promise<Response> {
    try {
      this.logger.log(`Start updating bot`);

      const bot = await this.botService.updateInfo(botId, botData);

      return right(
        Result.ok({
          bot: { ...bot, documents: bot.documents.map((doc) => doc._id) },
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
