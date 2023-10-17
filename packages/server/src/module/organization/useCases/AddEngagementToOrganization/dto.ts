import { EngagementResponse } from '@/shared/dto/engagement';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export default class AddEngagementToOrganizationDTO {
  @ApiProperty({
    description: 'Name of the Engagement',
    minLength: 1,
    maxLength: 320,
    required: false,
    default: 'default',
    example: 'New Engagement',
    type: String,
  })
  @MaxLength(320)
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Budget per Interaction',
    required: true,
    default: 1,
    example: 100,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  budgetPerInteraction: number;

  @ApiProperty({
    description: 'Executes At',
    required: true,
    example: 1696003200000,
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  executesAt: number;

  @ApiProperty({
    description: 'Ends Date',
    required: true,
    example: 1696003200000,
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  endsAt: number;

  @ApiProperty({
    description: 'Template ID',
    required: true,
    example: 'templateId',
    type: String,
  })
  @IsString()
  templateId: string;

  @ApiProperty({
    description: 'Contact IDs',
    required: true,
    example: ['contactId1', 'contactId2'],
    type: [String],
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  contactIds: string[];

  @ApiProperty({
    description: 'Engagement Channel IDs',
    example: ['channel1', 'channel2'],
    type: [String],
    required: true,
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  channelIds: string[];

  @ApiProperty({
    description: 'Knowledge Base IDs',
    required: true,
    example: ['knowledgeId1', 'knowledgeId2'],
    type: [String],
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  knowledgeBaseIds: string[];

  @ApiProperty({
    description: 'Agent ID',
    required: true,
    example: 'agentId',
    type: String,
  })
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({
    description: 'Outcome',
    required: true,
    example: 'APIExecuted',
    type: String,
  })
  @IsString()
  outcome: string;
}

export class AddEngagementOrganizationResponseDTO extends OmitType(
  EngagementResponse,
  ['deletedAt'] as const,
) {}
