import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AgentRole, OrganizationData } from '../interfaces/organization';
import { OrganizationResponse } from './organization';

class AgentTemplate {
  stageAnalyzer: string;
  prompt: string;
  toolsPrompt: string;
  conversationStages: Record<string, string>;
}
export class EngagementResponse {
  @ApiProperty({
    description: 'Engagement ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Engagement Name',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Organisation ID',
    type: String,
  })
  organizationId?: string;

  @ApiProperty({
    description: 'Organization ID',
    type: OrganizationResponse,
  })
  organization?: OrganizationData;

  @ApiProperty({
    description: 'Budget per Interaction',
    type: Number,
  })
  budgetPerInteraction?: number;

  @ApiProperty({
    description: 'Agent Name',
    type: String,
  })
  agentName?: string;

  @ApiProperty({
    description: 'Agent Role',
    enum: AgentRole,
  })
  agentRole?: AgentRole;

  @ApiProperty({
    description: 'Engagement Purpose',
    type: String,
  })
  purpose?: string;

  @ApiProperty({
    description: 'Execution Date',
    type: Date,
  })
  executesAt?: Date;

  @ApiProperty({
    description: 'End Date',
    type: Date,
  })
  endsAt?: Date;

  @ApiProperty({
    description: 'Template ID',
    type: String,
  })
  templateId?: string;

  @ApiProperty({
    description: 'Template',
    type: AgentTemplate,
  })
  template?: AgentTemplate;

  @ApiProperty({
    description: 'Contact IDs',
    type: [String],
  })
  contactIds?: string[];

  @ApiProperty({
    description: 'Channels',
    type: [String],
  })
  channels?: string[];

  @ApiProperty({
    description: 'Knowledge IDs',
    type: [String],
  })
  knowledgeIds?: string[];

  @ApiProperty({
    description: 'Outcome',
    type: String,
  })
  outcome?: string;

  @ApiProperty({
    description: 'Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Deleted Date',
    type: Date,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Updated Date',
    type: Date,
  })
  updatedAt?: Date;
}

export class EngagementIdParams {
  @ApiProperty({
    name: 'orgId',
    type: String,
    description: 'Organization ID',
  })
  @IsString()
  @IsNotEmpty()
  orgId: string;
  @ApiProperty({
    name: 'engagementId',
    type: String,
    description: 'Engagement ID',
  })
  @IsString()
  @IsNotEmpty()
  engagementId: string;
}

export class ExecuteEngagementResponse {
  @ApiProperty({
    description: 'Name of the Agent',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Say of the Agent',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  say: string;
}
