import { ApiProperty } from '@nestjs/swagger';
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
