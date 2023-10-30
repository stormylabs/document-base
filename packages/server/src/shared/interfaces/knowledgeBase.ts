import { OrganizationData } from './organization';
import { KnowledgeBaseType } from './index';
import { DocumentData } from './document';

export interface KnowledgeBaseData {
  _id: string;
  name: string;
  type: KnowledgeBaseType;
  organization: OrganizationData;
  documents: DocumentData[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
