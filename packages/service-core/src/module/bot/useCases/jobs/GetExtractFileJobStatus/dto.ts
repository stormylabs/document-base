import { ExtractFileJobResponse } from '@/shared/dto/extractFileJob';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class GetExtractFileJobStatusDTO {
  @ApiProperty({
    description: 'Extract file Job ID',
    required: true,
    type: String,
  })
  @IsString()
  jobId: string;
}

export class GetExtractFileJobStatusResponseDTO extends PartialType(
  PickType(ExtractFileJobResponse, [
    'status',
    'createdAt',
    'updatedAt',
  ] as const)
) {
  @ApiProperty({
    description: 'Extract File Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  botId: string;

  @ApiProperty({
    description: 'Progress of Extract File Job',
    type: Number,
  })
  progress: number;

  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}
