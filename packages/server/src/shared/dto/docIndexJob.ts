import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../interfaces';

export class DocIndexJobResponse {
  @ApiProperty({
    description: 'Train Job ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  bot?: string;

  @ApiProperty({
    description: 'Train Job Status',
    enum: JobStatus,
  })
  status?: JobStatus;

  @ApiProperty({
    description: 'Train Job indexed document count',
    type: Number,
  })
  indexed?: number;

  @ApiProperty({
    description: 'Train Job Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Train Job Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Train Job Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
