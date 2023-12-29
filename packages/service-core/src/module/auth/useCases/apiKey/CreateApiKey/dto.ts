import { ApiKeyResponse } from '@/shared/dto/apiKey';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class CreateApiKeyResponseDTO extends PartialType(
  PickType(ApiKeyResponse, ['_id', 'createdAt', 'apiKey'] as const)
) {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  userId: string;

  apiKey: string;
  _id: string;
  createdAt: Date;
}
