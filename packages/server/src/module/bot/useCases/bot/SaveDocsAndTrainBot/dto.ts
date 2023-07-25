import { DOCUMENT_LIMIT } from '@/shared/constants';
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
    maxItems: DOCUMENT_LIMIT,
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(DOCUMENT_LIMIT)
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
