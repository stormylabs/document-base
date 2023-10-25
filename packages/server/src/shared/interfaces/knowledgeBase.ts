import { OrganizationData } from './organization';
import { KnowledgeBaseType } from './index';

export interface KnowledgeBaseData {
  _id: string;
  name: string;
  type: KnowledgeBaseType;
  organization: OrganizationData;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
