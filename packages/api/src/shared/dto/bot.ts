import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponse } from './document';

export class BotResponse {
  @ApiProperty({
    description: 'Bot ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Bot Name',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Bot Documents',
    type: () => [DocumentResponse],
  })
  documents?: DocumentResponse[];

  @ApiProperty({
    description: 'Fallback Message',
    type: String,
  })
  fallbackMessage?: string;

  @ApiProperty({
    description: 'Prompt',
    type: String,
  })
  prompt?: string;

  @ApiProperty({
    description: 'Bot Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Bot Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
