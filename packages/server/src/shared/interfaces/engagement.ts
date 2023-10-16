import { OrganizationData } from './organization';

export class EngagementData {
  _id: string;
  name: string;
  organization: OrganizationData;
  budgetPerInteraction: number;
  executesAt: Date;
  endsAt: Date;
  templateId: string;
  contacts: string[];
  channels: string[];
  knowledgeBases: string[];
  outcome: string;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}
