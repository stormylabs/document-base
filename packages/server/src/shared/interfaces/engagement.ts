import { OrganizationData } from './organization';

export class Engagement {
  _id: string;
  name: string;
  organisation: OrganizationData;
  budgetPerInteraction: number;
  executesAt: Date;
  endsAt: Date;
  templateId: string;
  contactIds: string[];
  channels: string[];
  knowledgeIds: string[];
  outcome: InteractionEventType;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
}
