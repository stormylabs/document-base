import { IsString, MaxLength, MinLength } from 'class-validator';

export default class CreateBotDTO {
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  name: string;
}
