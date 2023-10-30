import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { AccessLevel } from '../interfaces/accessLevel';
import { UserResponse } from './user';
import { KnowledgeBaseResponse } from './knowledgeBase';
import { CrawlJobResponse } from './crawlJob';
import { ExtractFileJobResponse } from './extractFileJob';
import { OrganizationResponse } from './organization';

export class AddKnowledgeBaseJobResponse {
  @ApiProperty({
    description: 'Org ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Organization',
    type: () => OrganizationResponse,
  })
  organization?: OrganizationResponse;

  @ApiProperty({
    description: 'Knowledge Base',
    type: () => KnowledgeBaseResponse,
  })
  knowledgeBase?: KnowledgeBaseResponse;

  @ApiProperty({
    description: 'Crawl Job',
    type: () => CrawlJobResponse,
  })
  crawlJob?: CrawlJobResponse;

  @ApiProperty({
    description: 'Extract File Job',
    type: () => ExtractFileJobResponse,
  })
  extractFileJob?: ExtractFileJobResponse;

  @ApiProperty({
    description: 'Org Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Org Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}

export class AddKnowledgeBaseJobResponseDTO {
  @ApiProperty({
    description: 'Add knowledge base job ID',
    type: String,
  })
  jobId: string;
}
