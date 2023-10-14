import { EngagementResponse } from '@/shared/dto/engagement';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

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
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  budgetPerInteraction: number;

  @ApiProperty({
    description: 'Execution Date',
    required: true,
    example: '2022-01-01T00:00:00Z',
    type: Date,
  })
  @IsNotEmpty()
  executesAt: Date;

  @ApiProperty({
    description: 'End Date',
    required: true,
    example: '2022-01-31T23:59:59Z',
    type: Date,
  })
  @IsNotEmpty()
  endsAt: Date;

  @ApiProperty({
    description: 'Template ID',
    required: true,
    example: 'templateId',
    type: String,
  })
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'Contact IDs',
    required: true,
    example: ['contactId1', 'contactId2'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  contactIds: string[];

  @ApiProperty({
    description: 'Engagement Channels',
    example: ['channel1', 'channel2'],
    type: [String],
    required: false,
  })
  @IsNotEmpty()
  @IsArray()
  channels: string[];

  @ApiProperty({
    description: 'Knowledge Base IDs',
    required: true,
    example: ['knowledgeId1', 'knowledgeId2'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  knowledgeIds: string[];

  @ApiProperty({
    description: 'Outcome',
    required: true,
    example: 'outcome',
    type: String,
  })
  @IsNotEmpty()
  outcome: string;
}

export class AddEngagementOrganizationResponseDTO extends OmitType(
  EngagementResponse,
  ['deletedAt'] as const,
) {}
