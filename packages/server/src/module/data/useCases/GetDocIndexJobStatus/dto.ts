import { IsString } from 'class-validator';

export default class GetDocIndexJobStatusDTO {
  @IsString()
  jobId: string;
}
