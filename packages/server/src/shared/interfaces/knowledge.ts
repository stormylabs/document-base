import { KnowledgeType } from './knowledgeType';
import { OrganizationData } from './organization';

export class KnowledgeBase {
  _id: string;
  name: string;
  organisation: OrganizationData;
  type: KnowledgeType;
  descriptions: string; // on the FE we provide a tool template string to help users to succinctly create a description string for LLM to identify
  document: Document; // reuse the flow for document creation e.g. pdf, word, website
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
}
