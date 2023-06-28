import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export default class UpdateBotInfoDTO {
  // name is required for update
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  name: string;
}
