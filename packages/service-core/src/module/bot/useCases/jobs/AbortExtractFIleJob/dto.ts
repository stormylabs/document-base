import { ExtractFileJobResponse } from '@/shared/dto/extractFileJob';
import { JobStatus } from '@/shared/interfaces';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class AbortExtractFileJobResponseDTO extends PartialType(
  PickType(ExtractFileJobResponse, ['createdAt', 'updatedAt'] as const),
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

  @ApiProperty({
    description: 'Extract File Job Status',
    enum: JobStatus,
    example: JobStatus.Aborted,
  })
  status: JobStatus;

  createdAt: Date;
  updatedAt: Date;
}
