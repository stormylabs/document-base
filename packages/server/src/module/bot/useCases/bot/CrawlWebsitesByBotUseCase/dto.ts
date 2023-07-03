import { JobStatus } from '@/shared/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CrawlWebsitesByBotDTO {
  @ApiProperty({
    description: 'URLs to crawl',
    minItems: 1,
    maxItems: 10,
    required: true,
    type: [String],
    pattern: '^https://.*$',
  })
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  urls: string[];

  @ApiProperty({
    description: 'Max number of URLs to crawl',
    minimum: 1,
    maximum: 2000,
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(2000)
  limit: number;
}

export class CrawlWebsitesByBotResponseDTO {
  @ApiProperty({
    description: 'Crawl Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Crawl Job Status',
    enum: JobStatus,
  })
  status: JobStatus;
}
