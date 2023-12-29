import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';

import UpdateBotInfoDTO, { UpdateBotInfoResponseDTO } from './dto';
import { BotService } from '@/module/bot/services/bot.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<UpdateBotInfoResponseDTO>>;

@Injectable()
export default class UpdateBotInfoUseCase {
  private readonly logger = new Logger(UpdateBotInfoUseCase.name);
  constructor(private readonly botService: BotService) {}

  public async exec(
    botId: string,
    botData: UpdateBotInfoDTO
  ): Promise<Response> {
    try {
      this.logger.log(`Start updating bot`);

      const bot = await this.botService.findById(botId);
      if (!bot) return left(new NotFoundError(Resource.Bot, [botId]));

      const updatedBot = await this.botService.updateInfo(botId, botData);

      return right(
        Result.ok({
          bot: {
            ...updatedBot,
            documents: updatedBot.documents.map((doc) => doc._id),
          },
        })
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
