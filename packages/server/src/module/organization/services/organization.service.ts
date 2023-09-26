import { Injectable } from '@nestjs/common';
import { OrganizationData } from '@/shared/interfaces/organization';
import { OrganizationRepository } from '@/module/organization/repositories/organization.repository';

@Injectable()
export class OrganizationService {
  constructor(private orgRepository: OrganizationRepository) {}

  async create(data: { name: string }): Promise<OrganizationData> {
    const orgData: Partial<OrganizationData> = data;
    const createdOrg = await this.orgRepository.create(orgData);
    return createdOrg;
  }

  async findById(orgId: string): Promise<OrganizationData | null> {
    const org = await this.orgRepository.findById(orgId);
    return org;
  }

  async findOrgByUserId(userId: string): Promise<OrganizationData | null> {
    const org = await this.orgRepository.findOrgByUserId(userId);
    return org;
  }

  async delete(orgId: string): Promise<OrganizationData> {
    const exists = await this.exists([orgId]);
    if (!exists) throw new Error('Organization does not exist.');
    const updatedOrg = await this.orgRepository.update(orgId, {
      deletedAt: new Date(),
    });
    return updatedOrg;
  }

  async exists(orgIds: string[]): Promise<boolean> {
    return this.orgRepository.exists(orgIds);
  }

  async upsertMembers(
    orgId: string,
    userIds: string[],
  ): Promise<OrganizationData> {
    const exists = await this.exists([orgId]);
    if (!exists) throw new Error('Organization does not exist.');
    return this.orgRepository.upsertMembers(orgId, userIds);
  }
}
