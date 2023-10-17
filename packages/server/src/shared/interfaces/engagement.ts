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
  agentId: string;
  outcome: string;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
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
