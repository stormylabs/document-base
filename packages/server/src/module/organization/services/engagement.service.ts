import { Injectable } from '@nestjs/common';
import { EngagementRepository } from '../repositories/engagement.repository';
import { EngagementData } from '@/shared/interfaces/engagement';

@Injectable()
export class EngagementService {
  constructor(private engagementRepository: EngagementRepository) {}

  async create(
    engagementData: Partial<
      Omit<EngagementData, 'organization' | 'knowledgeBases'>
    > & {
      organizationId: string;
      knowledgeBaseIds: string[];
    },
  ): Promise<EngagementData> {
    const createdEngagement = await this.engagementRepository.create(
      engagementData,
    );
    return createdEngagement;
  }

  async findEngagementById(
    engagementId: string,
  ): Promise<EngagementData | null> {
    const engagement = await this.engagementRepository.findById(engagementId);
    return engagement;
  }

  async getEngagementOfOrganization(orgId: string): Promise<EngagementData[]> {
    const engagements = await this.engagementRepository.findEngagementByOrgId(
      orgId,
    );
    return engagements;
  }

  async delete(engagementId: string): Promise<EngagementData> {
    const exists = await this.exists([engagementId]);
    if (!exists) throw new Error('Knowledge does not exist.');
    const updatedEngagement = await this.engagementRepository.update(
      engagementId,
      {
        deletedAt: new Date(),
      },
    );
    return updatedEngagement;
  }

  async exists(engagementId: string[]): Promise<boolean> {
    return this.engagementRepository.exists(engagementId);
  }
}
