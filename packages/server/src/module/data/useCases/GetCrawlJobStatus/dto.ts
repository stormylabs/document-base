import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class GetCrawlJobStatusDTO {
  @ApiProperty()
  @IsString()
  jobId: string;
}
