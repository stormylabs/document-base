import { DocIndexJobResponse } from '@/shared/dto/docIndexJob';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
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

export class GetTrainJobStatusResponseDTO extends PartialType(
  PickType(DocIndexJobResponse, ['status', 'createdAt', 'updatedAt'] as const),
) {
  @ApiProperty({
    description: 'Train Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  botId: string;

  @ApiProperty({
    description: 'Progress of Train Job',
    type: Number,
  })
  progress: number;

  @ApiProperty({
    description: 'Number of documents trained',
    type: Number,
  })
  trained: number;

  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}
