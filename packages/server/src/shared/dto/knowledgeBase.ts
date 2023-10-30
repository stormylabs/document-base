import { ApiProperty } from '@nestjs/swagger';
import { KnowledgeBaseType } from '../interfaces';

export class KnowledgeBaseResponse {
  @ApiProperty({
    description: 'Extract File Job ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Knowledge Base Name',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Knowledge Base Type',
    enum: KnowledgeBaseType,
  })
  type?: KnowledgeBaseType;

  @ApiProperty({
    description: 'Extract File Job Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Extract File Job Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Extract File Job Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
