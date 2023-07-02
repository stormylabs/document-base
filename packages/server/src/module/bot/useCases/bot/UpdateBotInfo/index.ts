import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import UpdateBotInfoDTO from './dto';
import { BotService } from '@/module/bot/services/bot.service';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{
    bot: {
      documents: string[];
      _id: string;
      name: string;
      createdAt: Date;
      deletedAt: Date;
    };
  }>
>;

@Injectable()
export default class UpdateBotInfoUseCase {
  private readonly logger = new Logger(UpdateBotInfoUseCase.name);
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
