import { OrganizationData } from './organization';

export class Engagement {
  _id: string;
  name: string;
  organisationId: string;
  budgetPerInteraction: number;
  executesAt: Date;
  endsAt: Date;
  templateId: string;
  contactIds: string[];
  channels: string[];
  knowledgeIds: string[];
  outcome: string;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
}
