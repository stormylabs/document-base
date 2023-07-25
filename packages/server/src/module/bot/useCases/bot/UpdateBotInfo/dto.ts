import { BotResponse } from '@/shared/dto/bot';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @ApiProperty({
    description: 'Fallback message',
    minLength: 1,
    maxLength: 400,
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(400)
  @MinLength(1)
  @IsOptional()
  fallbackMessage?: string;

  @IsString()
  @MaxLength(400)
  @MinLength(1)
  @IsOptional()
  prompt?: string;
}

export class UpdateBotResponse extends PartialType(
  PickType(BotResponse, [
    '_id',
    'name',
    'createdAt',
    'deletedAt',
    'fallbackMessage',
    'prompt',
  ] as const),
) {
  _id: string;
  name: string;
  createdAt: Date;
  deletedAt: Date;
  fallbackMessage: string;
  prompt: string;

  @ApiProperty({
    type: () => [String],
    isArray: true,
  })
  documents: string[];
}

export class UpdateBotInfoResponseDTO {
  @ApiProperty({
    type: UpdateBotResponse,
  })
  bot: UpdateBotResponse;
}
