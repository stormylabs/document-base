import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BotUsageService } from '../../services/botUsage.service';
import { GetUsageByBotIdResponseDTO } from './dto';

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
  public async exec(botId: string, from: Date, to: Date): Promise<Response> {
    try {
      this.logger.log(`Start getting usages by bot id`);

      const botUsages = await this.botUsageService.findUsagesByBotId(
        botId,
        from,
        to,
      );

      const resourceUsages = await this.resourceUsageService.findUsagesByBotId(
        botId,
        from,
        to,
      );

      this.logger.log(`Got usages by bot id successfully`);

      return right(Result.ok({ bot: botUsages, resource: resourceUsages }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
