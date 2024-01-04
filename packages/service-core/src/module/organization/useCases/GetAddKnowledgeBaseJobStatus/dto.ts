import { AddKnowledgeBaseJobResponse } from '@/shared/dto/addKnowledgeBaseJob';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class GetCrawlJobStatusDTO {
  @ApiProperty({
    description: 'Crawl Job ID',
    required: true,
    type: String,
  })
  @IsString()
  jobId: string;
}

export class GetAddKnowledgeBaseJobStatusResponseDTO extends PartialType(
  PickType(AddKnowledgeBaseJobResponse, ['createdAt'] as const),
) {
  @ApiProperty({
    description: 'Crawl Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Progress of Crawl Job',
    type: Number,
  })
  progress: number;

  status: JobStatus;
  createdAt?: Date;
}
