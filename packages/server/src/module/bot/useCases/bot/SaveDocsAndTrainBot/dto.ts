import { JobStatus } from '@/shared/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
} from 'class-validator';

export default class SaveDocsAndTrainBotDTO {
  @ApiProperty({
    description: 'Document IDs',
    required: true,
    minItems: 1,
    maxItems: 2000,
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(2000)
  @ArrayMinSize(1)
  documentIds: string[];
}

export class SaveDocsAndTrainBotResponseDTO {
  @ApiProperty({
    description: 'Train Job ID',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Train Job Status',
    enum: JobStatus,
  })
  status: JobStatus;
}
