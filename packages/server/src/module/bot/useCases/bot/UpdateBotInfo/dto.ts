import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export default class UpdateBotInfoDTO {
  // name is required for update
  @ApiProperty({
    description: 'Name of the bot',
    minLength: 1,
    maxLength: 50,
    required: true,
    type: String,
  })
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  name: string;
}
