import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export default class MessageBotDTO {
  @ApiProperty({
    description: 'Message to the bot',
    required: true,
    type: String,
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: "User's part of the conversation history",
    required: true,
    minItems: 0,
    maxItems: 15,
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayMaxSize(15)
  conversationHistory: string[];
}

export class MessageBotResponseDTO {
  @ApiProperty({
    description: 'Message to the bot',
    type: String,
  })
  message: string;
}
