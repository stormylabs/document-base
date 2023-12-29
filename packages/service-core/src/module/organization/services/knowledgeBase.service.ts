import { Injectable } from '@nestjs/common';
import { KnowledgeBaseData } from '@/shared/interfaces/knowledgeBase';
import { KnowledgeBaseRepository } from '@/module/organization/repositories/knowledgeBase.repository';
import { KnowledgeBaseType } from '@/shared/interfaces';

@Injectable()
export class KnowledgeBaseService {
  constructor(private knowledgeBaseRepository: KnowledgeBaseRepository) {}

  async create(data: {
    name: string;
    type: KnowledgeBaseType;
    organizationId: string;
  }): Promise<KnowledgeBaseData> {
    const knowledgeBase = await this.knowledgeBaseRepository.create(data);
    return knowledgeBase;
  }

  async findById(knowledgeBaseId: string): Promise<KnowledgeBaseData | null> {
    const knowledgeBase = await this.knowledgeBaseRepository.findById(
      knowledgeBaseId
    );
    return knowledgeBase;
  }

  /**
   * get knowledge base by organization Id
   *
   * Get all knowledge base by organization
   *
   * @param orgId
   * @returns
   */
  async getKnowledgeBaseByOrgId(orgId: string): Promise<KnowledgeBaseData[]> {
    const knowledgeBase = await this.knowledgeBaseRepository.findByOrgId(orgId);
    return knowledgeBase;
  }

  async delete(knowledgeBaseId: string): Promise<KnowledgeBaseData> {
    const exists = await this.exists([knowledgeBaseId]);
    if (!exists) throw new Error('Knowledge base does not exist.');
    const updatedData = await this.knowledgeBaseRepository.update(
      knowledgeBaseId,
      {
        deletedAt: new Date(),
      }
    );
    return updatedData;
  }

  async exists(knowledgeBaseIds: string[]): Promise<boolean> {
    return this.knowledgeBaseRepository.exists(knowledgeBaseIds);
  }

  async upsertDocument(
    knowledgeBaseId: string,
    documentId: string
  ): Promise<KnowledgeBaseData> {
    const exists = await this.exists([knowledgeBaseId]);
    if (!exists) throw new Error('Bot does not exist.');
    return this.knowledgeBaseRepository.upsertDocuments(knowledgeBaseId, [
      documentId,
    ]);
  }
}
