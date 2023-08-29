import { ApiKeyResponse } from '@/shared/dto/apiKey';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class CreateApiKeyResponseDTO extends PartialType(
  PickType(ApiKeyResponse, ['_id', 'apiKey', 'createdAt'] as const),
) {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  userId: string;

  _id: string;
  apiKeyId: string;
  createdAt: Date;
}
