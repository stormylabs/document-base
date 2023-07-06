import { BotResponse } from '@/shared/dto/bot';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export default class CreateBotDTO {
  @ApiProperty({
    description: 'Name of the bot',
    minLength: 1,
    maxLength: 50,
    required: false,
    default: 'default',
    type: String,
  })
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  @IsOptional()
  name?: string;
}

export class CreateBotResponseDTO {
  @ApiProperty({
    type: OmitType(BotResponse, ['deletedAt'] as const),
  })
  bot: Omit<BotResponse, 'deletedAt'>;
}
