import { DOCUMENT_LIMIT } from '@/shared/constants';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, Max, Min } from 'class-validator';

export default class CrawlFilesByBotFileDTO {
  @ApiProperty({
    description: 'Max number of URLs to crawl',
    minimum: 1,
    maximum: DOCUMENT_LIMIT,
    required: true,
    type: Number,
  })
  @IsNumberString()
  @Min(1)
  @Max(DOCUMENT_LIMIT)
  limit: number;

  @ApiProperty({
    type: 'array', // 👈  array of files
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Files of the bot',
  })
  files: Array<Express.Multer.File>;
}

export class CrawlFilesByBotResponseDTO {
  @ApiProperty({
    description: 'Crawl Files Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Crawl Files Job Status',
    enum: JobStatus,
  })
  status: JobStatus;
}
