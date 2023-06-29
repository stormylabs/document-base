import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export default class MessageBotDTO {
  @IsString()
  message: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayMaxSize(15)
  conversationHistory: string[];
}
