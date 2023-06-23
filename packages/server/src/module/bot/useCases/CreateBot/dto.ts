import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export default class CreateBotDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  @IsOptional()
  name?: string;
}
