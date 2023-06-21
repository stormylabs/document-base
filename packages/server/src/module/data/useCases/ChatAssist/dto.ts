import {
  IsArray,
  IsNumber,
  IsString,
  Max,
  Min,
  ArrayMaxSize,
} from 'class-validator';

export default class ChatAssistDTO {
  @IsString()
  query: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayMaxSize(15)
  conversationHistory: string[];

  @IsNumber()
  @Min(1)
  @Max(5)
  numOfAnswers: number;

  @IsString()
  tag: string;
}
