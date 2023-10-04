import { OrganizationResponse } from '@/shared/dto/organization';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

// Example of Request DTO
// {
// 	name: string;
// 	budgetPerInteraction: number;
// 	executesAt: Date;
// 	endsAt: Date;
// 	templateId: Template
// 	contactIds: string[];
// 	channels: EngagementChannel[];
// 	knowledgeIds: string[];
// 	outcome: InteractionEventType;
// 	... // to be extended
// }

type InteractionEventType =
  | 'CustomerMessageReceived'
  | 'APIExecuted'
  | 'PluginExecuted';

export default class AddEngagementToOrganizationDTO {
  @ApiProperty({
    description: 'Name of the Engagement',
    minLength: 1,
    maxLength: 320,
    required: true,
    default: 'default',
    example: 'New Engagement',
    type: String,
  })
  @MaxLength(320)
  @MinLength(1)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Budget per Interaction',
    required: true,
    default: 0,
    example: 100,
    type: Number,
  })
  budgetPerInteraction: number;

  @ApiProperty({
    description: 'Execution Date',
    required: true,
    example: '2022-01-01T00:00:00Z',
    type: Date,
  })
  executesAt: Date;

  @ApiProperty({
    description: 'End Date',
    required: true,
    example: '2022-01-31T23:59:59Z',
    type: Date,
  })
  endsAt: Date;

  @ApiProperty({
    description: 'Template ID',
    required: true,
    example: 'templateId',
    type: String,
  })
  templateId: string;

  @ApiProperty({
    description: 'Contact IDs',
    required: true,
    example: ['contactId1', 'contactId2'],
    type: [String],
  })
  contactIds: string[];

  @ApiProperty({
    description: 'Engagement Channels',
    required: true,
    example: ['channel1', 'channel2'],
    type: [String],
  })
  channels: string[];

  @ApiProperty({
    description: 'Knowledge Base IDs',
    required: true,
    example: ['knowledgeBaseId1', 'knowledgeBaseId2'],
    type: [String],
  })
  knowledgeIds: string[];

  @ApiProperty({
    description: 'Outcome',
    required: true,
    example: 'outcome',
    type: String,
  })
  outcome: InteractionEventType;
}

export class AddEngagementOrganizationResponseDTO extends OmitType(
  OrganizationResponse,
  ['deletedAt'] as const,
) {}
