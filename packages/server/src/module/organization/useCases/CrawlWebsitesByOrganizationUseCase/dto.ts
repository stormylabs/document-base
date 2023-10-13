import { JobStatus } from '@/shared/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class CrawlWebsitesByOrganizationDTO {
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
    description: 'Flag to crawl job ',
    required: true,
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  only: boolean;
}

export class CrawlWebsitesByOrganizationResponseDTO {
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
