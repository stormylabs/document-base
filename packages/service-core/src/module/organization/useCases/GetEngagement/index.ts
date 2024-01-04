import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { Resource } from '@/shared/interfaces';
import { EngagementService } from '../../services/engagement.service';
import { GetEngagementResponseDto } from './dto';
import { agentTemplates } from '@/shared/constants/agentTemplate';

type Response = Either<Result<UseCaseError>, Result<GetEngagementResponseDto>>;

@Injectable()
export default class GetEngagementUseCase {
  private readonly logger = new Logger(GetEngagementUseCase.name);
  constructor(private readonly engagementService: EngagementService) {}
  public async exec(engagementId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting engagement`);

      const { templateId, ...engagement } =
        await this.engagementService.findEngagementById(engagementId);

      const { id, ...rest } = agentTemplates.find(
        (template) => template.id === templateId,
      );

      if (!engagement) {
        return left(new NotFoundError(Resource.Engagement, [engagementId]));
      }

      return right(
        Result.ok({
          ...engagement,
          template: rest,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
