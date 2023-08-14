import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../interfaces';

export class CrawlJobResponse {
  @ApiProperty({
    description: 'Crawl Job ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  bot?: string;

  @ApiProperty({
    description: 'Crawl Job Limit',
    type: Number,
  })
  limit?: number;

  @ApiProperty({
    description: 'Document IDs',
    type: [String],
  })
  documents?: string[];

  @ApiProperty({
    description: 'Crawl Job Status',
    enum: JobStatus,
  })
  status?: JobStatus;

  @ApiProperty({
    description: 'Initial URLs',
    type: [String],
  })
  initUrls?: string[];

  @ApiProperty({
    description: 'Crawl Job Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Crawl Job Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Crawl Job Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}

export interface CrawlJobMessage {
  botId: string;
  jobId: string;
  documentId: string;
}
