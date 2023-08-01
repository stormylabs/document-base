import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../interfaces';

export class ExtractFileJobResponse {
  @ApiProperty({
    description: 'Extract File Job ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  bot?: string;

  @ApiProperty({
    description: 'Extract File Job Limit',
    type: Number,
  })
  limit?: number;

  @ApiProperty({
    description: 'Document IDs',
    type: [String],
  })
  documents?: string[];

  @ApiProperty({
    description: 'Extract File Job Status',
    enum: JobStatus,
  })
  status?: JobStatus;

  @ApiProperty({
    description: 'Initial URLs',
    type: [String],
    isArray: true,
  })
  initUrls?: string[];

  @ApiProperty({
    description: 'Extract File Job Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Extract File Job Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Extract File Job Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}

export interface ExtractFileJobMessage {
  botId: string;
  jobId: string;
  documentId: string;
}
