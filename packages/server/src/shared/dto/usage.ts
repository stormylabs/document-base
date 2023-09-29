import { ApiProperty } from '@nestjs/swagger';
import { BillableResource } from '../interfaces/usage';

export class ResourceUsageResponse {
  @ApiProperty({
    description: 'Resource Usage ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  bot?: string;

  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  user?: string;

  @ApiProperty({
    description: 'Billable Resource',
    enum: BillableResource,
  })
  resource?: BillableResource;

  @ApiProperty({
    description: 'Resource Usage Created Date',
    type: Date,
  })
  createdAt?: Date;
}

export class BotUsageResponse {
  @ApiProperty({
    description: 'Bot Usage ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  bot?: string;

  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  user?: string;

  @ApiProperty({
    description: 'Bot Usage Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Bot Usage Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
