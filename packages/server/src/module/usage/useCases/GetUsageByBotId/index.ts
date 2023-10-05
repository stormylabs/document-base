import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BotUsageService } from '../../services/botUsage.service';
import { GetUsageByBotIdResponseDTO } from './dto';
import { getCostsInPeriod } from '@/shared/utils/getCostsInPeriod';

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
      } = getCostsInPeriod(botUsages, resourceUsages, from, to);

      this.logger.log(`Got usages by bot id successfully`);

      return right(
        Result.ok({
          bot: { usages: botUsages, costs: parseFloat(botCost.toFixed(3)) },
          resource: {
            usages: resourceUsages,
            costs: parseFloat(resourceCost.toFixed(3)),
          },
          total: parseFloat(total.toFixed(3)),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
