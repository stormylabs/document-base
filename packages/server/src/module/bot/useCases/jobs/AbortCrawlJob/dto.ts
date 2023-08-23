import { CrawlJobResponse } from '@/shared/dto/crawlJob';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class AbortCrawlJobResponseDTO extends PartialType(
  PickType(CrawlJobResponse, [
    'status',
    'createdAt',
    'updatedAt',
    'limit',
  ] as const),
) {
  @ApiProperty({
    description: 'Crawl Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  botId: string;

  @ApiProperty({
    description: 'Progress of Crawl Job',
    type: Number,
  })
  progress: number;

  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  limit: number;
}
