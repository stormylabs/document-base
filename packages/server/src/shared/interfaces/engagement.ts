import { AgentRole, OrganizationData } from './organization';

export class EngagementData {
  _id: string;
  name: string;
  organization: OrganizationData;
  budgetPerInteraction: number;
  agentName: string;
  agentRole: AgentRole;
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
