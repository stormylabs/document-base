import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { AddEngagementOrganizationResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { EngagementService } from '../../services/engagement.service';
import { AgentRole } from '@/shared/interfaces/organization';

type Response = Either<
  Result<UseCaseError>,
  Result<AddEngagementOrganizationResponseDTO>
>;

@Injectable()
export default class AddEngagementOrganizationUseCase {
  private readonly logger = new Logger(AddEngagementOrganizationUseCase.name);
  constructor(private readonly engagementService: EngagementService) {}
  public async exec(
    name: string,
    organizationId: string,
    budgetPerInteraction: number,
    agentName: string,
    agentRole: AgentRole,
    purpose: string,
    executesAt: number,
    endsAt: number,
    templateId: string,
    contacts: string[],
    channelIds: string[],
    knowledgeBaseIds: string[],
    outcome: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating Engagement`);
      console.log({ knowledgeBaseIds });

      const engagement = await this.engagementService.create({
        name,
        organizationId,
        budgetPerInteraction,
        agentName,
        agentRole: AgentRole[agentRole],
        purpose,
        executesAt: new Date(executesAt),
        endsAt: new Date(endsAt),
        templateId,
        contacts,
        channels: channelIds,
        knowledgeBaseIds,
        outcome,
      });

      return right(Result.ok(engagement));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
