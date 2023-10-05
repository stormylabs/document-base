import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BotUsageService } from '../../services/botUsage.service';
import { GetUsageByBotIdResponseDTO } from './dto';
import { getCostsInPeriod } from '@/shared/utils/getCostsInPeriod';
import keyBy from 'lodash/keyBy';
import { encode } from 'gpt-3-encoder';
import { BotService } from '@/module/bot/services/bot.service';
import { BotData } from '@/shared/interfaces/bot';

type Response = Either<
  Result<UseCaseError>,
  Result<GetUsageByBotIdResponseDTO>
>;

@Injectable()
export default class GetUsageByBotIdUseCase {
  private readonly logger = new Logger(GetUsageByBotIdUseCase.name);
  constructor(
    private readonly botUsageService: BotUsageService,
    private readonly resourceUsageService: ResourceUsageService,
    private readonly botService: BotService,
  ) {}
  public async exec(
    userId: string,
    botId: string,
    from: Date,
    to: Date,
  ): Promise<Response> {
    try {
      this.logger.log(`Start getting usages by bot id`);

      const botUsages =
        await this.botUsageService.findUsagesInPeriodByBotIdUserId(
          botId,
          userId,
          from,
          to,
        );

      const botIds = botUsages.map((usage) => usage.bot);

      const bots = await this.botService.findByBotIds(botIds);

      const keyedBots: Record<string, BotData> = keyBy(bots, '_id');

      const botUsageWithTokens = botUsages.map((usage) => {
        const { documents } = keyedBots[usage.bot];
        const tokens = documents.reduce(
          (acc, doc) => acc + (doc.content ? encode(doc.content).length : 0),
          0,
        );
        return {
          ...usage,
          tokens,
        };
      });

      const resourceUsages =
        await this.resourceUsageService.findUsagesInPeriodByBotIdUserId(
          botId,
          userId,
          from,
          to,
        );

      const {
        bot: botCost,
        resource: resourceCost,
        total,
        tokens,
      } = getCostsInPeriod(botUsageWithTokens, resourceUsages, from, to);

      this.logger.log(`Got usages by bot id successfully`);

      return right(
        Result.ok({
          bot: { usages: botUsages, costs: parseFloat(botCost.toFixed(3)) },
          resource: {
            usages: resourceUsages,
            costs: parseFloat(resourceCost.toFixed(3)),
          },
          total: parseFloat(total.toFixed(3)),
          tokens,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
