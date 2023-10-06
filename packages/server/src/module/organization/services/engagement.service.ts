import { Injectable } from '@nestjs/common';


import { EngagementRepository } from '../repositories/engagement.repository';
import { EngagementData } from '@/shared/interfaces/engagement';

@Injectable()
export class EngagementService {
  constructor(private engagementRepository: EngagementRepository) {}

  async create(
    engagementData: Omit<EngagementData, '_id'>,
  ): Promise<EngagementData> {
    console.log(`Start creating organization`, engagementData);
    const createdEngagemenet = await this.engagementRepository.create(
      engagementData,
    );
    console.log(`createdEngagemenet`, createdEngagemenet);
    return createdEngagemenet;
  }

  async findById(memberId: string): Promise<EngagementData | null> {
    const member = await this.engagementRepository.findById(memberId);
    return member;
  }

  /**
   * getMemberOfOrganization
   *
   * Get all member of organization
   *
   * @param orgId
   * @returns
   */
  async getEngagementOfOrganization(orgId: string): Promise<EngagementData[]> {
    const members = await this.engagementRepository.findEngagementByOrgId(
      orgId,
    );
    return members;
  }

  async delete(memberId: string): Promise<EngagementData> {
    const exists = await this.exists([memberId]);
    if (!exists) throw new Error('Knowledge does not exist.');
    const updatedOrg = await this.engagementRepository.update(memberId, {
      deletedAt: new Date(),
    });
    return updatedOrg;
  }

  async exists(memberIds: string[]): Promise<boolean> {
    return this.engagementRepository.exists(memberIds);
  }
}
