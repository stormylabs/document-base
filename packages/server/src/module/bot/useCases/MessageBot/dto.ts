import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export default class MessageBotDTO {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @ArrayMaxSize(15)
  conversationHistory: string[];
}
