import { KnowledgeBaseData } from './knowledgeBase';
import { UserData } from './user';

export interface OrganizationData {
  _id: string;
  name: string;
  descriptions: string;
  values: string;
  knowledgeBases: KnowledgeBaseData[];
  members: UserData[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export enum AgentRole {
  SALES_REP = 'sales-rep',
  CUSTOMER_SERVICE_REP = 'customer-service-rep',
}
