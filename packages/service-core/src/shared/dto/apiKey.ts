import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyResponse {
  @ApiProperty({
    description: 'API Key ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Unique API Key',
    type: String,
  })
  apiKey?: string;

  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  user?: string;

  @ApiProperty({
    description: 'API Key Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'API Key Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'API Key Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
