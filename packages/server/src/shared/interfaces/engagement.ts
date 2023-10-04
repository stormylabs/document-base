export class EngagementData {
  _id: string;
  name: string;
  organizationId: string;
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
