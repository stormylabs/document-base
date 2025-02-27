import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class MessageBotDTO {
  @ApiProperty({
    description: 'Message to the bot',
    required: true,
    type: String,
  })
  @IsString()
  message: string;

  @ApiProperty({
    description:
      'Conversation history between the bot and the user in a descending chronological order',
    required: true,
    minItems: 0,
    maxItems: 10,
    type: [String],
    minLength: 1,
    maxLength: 1000,
    example: [
      'assistant: 很抱歉，目前未能從上下文中找到具體關於如何在Bowtie官方網站獲取戰癌保300報價的步驟。\n\n...',
      'user: 請問如何得到報價？',
      'assistant: The Cancer Fighter insurance plan is not available for certain individuals based on ...',
      'user: What type of people are not eligible to purchase this particular insurance plan?',
    ],
  })
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(1000, { each: true })
  @IsArray()
  @ArrayMaxSize(10)
  conversationHistory: string[];
}

export class MessageBotResponseDTO {
  @ApiProperty({
    description: 'Message to the bot',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Document sources',
    type: [String],
  })
  sources: string[];
}
