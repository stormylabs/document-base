import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import UseCaseError from '@/shared/core/UseCaseError';

import { Resource } from '@/shared/interfaces';
import { EngagementService } from '../../services/engagement.service';
import { GetEngagementResponseDto } from './dto';

type Response = Either<Result<UseCaseError>, Result<GetEngagementResponseDto>>;

@Injectable()
export default class GetEngagementUseCase {
  private readonly logger = new Logger(GetEngagementUseCase.name);
  constructor(private readonly engagementService: EngagementService) {}
  public async exec(engagementId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting engagement`);

      const engagement = await this.engagementService.findEngagementById(
        engagementId,
      );

      if (!engagement) {
        return left(new NotFoundError(Resource.Engagement, [engagementId]));
      }

      return right(Result.ok({ ...engagement }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
