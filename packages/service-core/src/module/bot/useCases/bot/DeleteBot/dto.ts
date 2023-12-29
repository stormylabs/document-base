import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { BotResponse } from '@/shared/dto/bot';

class DeleteBotResponse extends PartialType(
  PickType(BotResponse, [
    '_id',
    'name',
    'createdAt',
    'fallbackMessage',
    'prompt',
    'deletedAt',
  ] as const)
) {
  _id: string;
  name: string;
  createdAt: Date;
  fallbackMessage: string;
  prompt: string;
  deletedAt: Date;
}

export class DeleteBotResponseDTO {
  @ApiProperty({
    type: DeleteBotResponse,
  })
  bot: DeleteBotResponse;
}
