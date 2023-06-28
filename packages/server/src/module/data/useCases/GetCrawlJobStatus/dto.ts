import { IsString } from 'class-validator';

export default class GetCrawlJobStatusDTO {
  @IsString()
  jobId: string;
}
