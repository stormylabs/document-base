import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@/shared/interfaces/document';

export class DocumentResponse {
  @ApiProperty({
    description: 'Document ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Document Type',
    enum: DocumentType,
  })
  type?: DocumentType;

  @ApiProperty({
    description: 'Source Name',
    type: String,
  })
  sourceName?: string;

  @ApiProperty({
    description: 'Document Content',
    type: String,
  })
  content?: string;

  @ApiProperty({
    description: 'Document Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Document Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
