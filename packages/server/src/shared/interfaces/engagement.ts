import { OrganizationData } from './organization';

export class EngagementData {
  _id: string;
  name: string;
  organization: OrganizationData;
  budgetPerInteraction: number;
  agentName: string;
  agentRole: string;
  purpose: string;
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

export class ExecuteEngagementData {
  engagementId: string;
  message: string;
  conversationHistory: string[];
}

export class EngagementQueuePayload {
  engagementId: string;
  message: string;
  conversationHistory: string[];
}

export class ExecuteEngagementQueueResponse {
  name: string;
  message: string;
}
