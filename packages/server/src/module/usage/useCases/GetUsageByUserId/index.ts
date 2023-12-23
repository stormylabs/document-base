import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BotUsageService } from '../../services/botUsage.service';
import { GetUsageByUserIdResponseDTO } from './dto';
import { getCostsInPeriod } from '@/shared/utils/getCostsInPeriod';
import { COST_PER_TOKEN_PER_BOT_PER_DAY } from '@/shared/constants/costs';

type Response = Either<
  Result<UseCaseError>,
  Result<GetUsageByUserIdResponseDTO>
>;

@Injectable()
export default class GetUsageByUserIdUseCase {
  private readonly logger = new Logger(GetUsageByUserIdUseCase.name);
  constructor(
    private readonly botUsageService: BotUsageService,
    private readonly resourceUsageService: ResourceUsageService,
  ) {}
  public async exec(userId: string, from: Date, to: Date): Promise<Response> {
    try {
      this.logger.log(`Start getting usages by user id`);

      console.log('>> server', {
        userId,
        from,
        to,
      });

      const botUsages = await this.botUsageService.findUsagesInPeriodByUserId(
        userId,
        from,
        to,
      );

      const resourceUsages =
        await this.resourceUsageService.findUsagesInPeriodByUserId(
          userId,
          from,
          to,
        );

      const {
        bot: botCost,
        resource: resourceCost,
        total,
        tokens,
      } = getCostsInPeriod(botUsages, resourceUsages, from, to);

      this.logger.log(`Got usages by user id successfully`);

      return right(
        Result.ok({
          bot: {
            usages: botUsages.map((usage) => ({
              ...usage,
              // bot: usage?.bot?._id,
              bot: {
                ...usage.bot,
                costs:
                  COST_PER_TOKEN_PER_BOT_PER_DAY *
                  (usage?.bot?.totalTokens || 0),
              },
            })),
            costs: parseFloat(botCost.toFixed(3)),
          },
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
