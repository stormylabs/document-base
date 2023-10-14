import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
    description: 'Budget per Interaction',
    type: Number,
  })
  budgetPerInteraction?: number;

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

export class EngagemnetIdParams {
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
