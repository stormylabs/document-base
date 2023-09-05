import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { ResourceUsageService } from '@/module/usage/services/resourceUsage.service';
import { BotUsageService } from '../../services/botUsage.service';
import { GetUsageByUserIdResponseDTO } from './dto';

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

      const botUsages = await this.botUsageService.findUsagesByUserId(
        userId,
        from,
        to,
      );

      const resourceUsages = await this.resourceUsageService.findUsagesByUserId(
        userId,
        from,
        to,
      );
      this.logger.log(`Got usages by user id successfully`);

      return right(Result.ok({ bot: botUsages, resource: resourceUsages }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
