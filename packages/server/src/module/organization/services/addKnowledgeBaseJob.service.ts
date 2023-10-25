import { Injectable } from '@nestjs/common';
import { AddKnowledgeBaseJobData } from '@/shared/interfaces/addKnowledgeBaseJob';
import { AddKnowledgeBaseJobRepository } from '@/module/organization/repositories/addKnowledgeBaseJob.repository';

@Injectable()
export class AddKnowledgeBaseJobService {
  constructor(
    private addKnowledgeBaseJobRepository: AddKnowledgeBaseJobRepository,
  ) {}

  async create(data: {
    crawlJobId: string;
    knowledgeBaseId: string;
    organizationId: string;
    extractFileJobId: string;
  }): Promise<AddKnowledgeBaseJobData> {
    const addKnowledgeBaseJob = await this.addKnowledgeBaseJobRepository.create(
      data,
    );
    return addKnowledgeBaseJob;
  }

  async findById(
    knowledgeBaseId: string,
  ): Promise<AddKnowledgeBaseJobData | null> {
    const addKnowledgeBaseJob =
      await this.addKnowledgeBaseJobRepository.findById(knowledgeBaseId);
    return addKnowledgeBaseJob;
  }

  /**
   * get knowledge base Of organization
   *
   * Get all knowledge base by organization
   *
   * @param orgId
   * @returns
   */
  async getMemberOfOrganization(
    orgId: string,
  ): Promise<AddKnowledgeBaseJobData[]> {
    const addKnowledgeBaseJob =
      await this.addKnowledgeBaseJobRepository.findByOrgId(orgId);
    return addKnowledgeBaseJob;
  }

  async delete(knowledgeBaseId: string): Promise<AddKnowledgeBaseJobData> {
    const exists = await this.exists([knowledgeBaseId]);
    if (!exists) throw new Error('Knowledge base does not exist.');
    const updatedData = await this.addKnowledgeBaseJobRepository.update(
      knowledgeBaseId,
      {
        deletedAt: new Date(),
      },
    );
    return updatedData;
  }

  async exists(knowledgeBaseIds: string[]): Promise<boolean> {
    return this.addKnowledgeBaseJobRepository.exists(knowledgeBaseIds);
  }
}
