import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class GetDocIndexJobStatusDTO {
  @ApiProperty({
    description: 'Train Job ID',
    required: true,
    type: String,
  })
  @IsString()
  jobId: string;
}
