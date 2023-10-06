import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { AddEngagementOrganizationResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { EngagementService } from '../../services/engagement.service';
import { EngagementData } from '@/shared/interfaces/engagement';

type Response = Either<
  Result<UseCaseError>,
  Result<AddEngagementOrganizationResponseDTO>
>;

@Injectable()
export default class AddEngagementOrganizationUseCase {
  private readonly logger = new Logger(AddEngagementOrganizationUseCase.name);
  constructor(private readonly engagementService: EngagementService) {}
  public async exec(
    name,
    organizationId,
    budgetPerInteraction,
    executesAt,
    endsAt,
    templateId,
    contactIds,
    channels,
    knowledgeIds,
    outcome,
  ): Promise<Response> {
    console.log({
      name,
      organizationId,
      budgetPerInteraction,
      executesAt,
      endsAt,
      templateId,
      contactIds,
      channels,
      knowledgeIds,
      outcome,
    });
    try {
      this.logger.log(`Start creating organization`);

      const engagement: EngagementData = await this.engagementService.create({
        name,
        organizationId,
        budgetPerInteraction,
        executesAt: new Date(executesAt),
        endsAt: new Date(endsAt),
        templateId,
        contactIds,
        channels,
        knowledgeIds,
        outcome,
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
      });

      return right(Result.ok(engagement));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
