import { ApiKeyResponse } from '@/shared/dto/apiKey';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class CreateApiKeyResponseDTO extends PartialType(
  PickType(ApiKeyResponse, ['_id', 'createdAt'] as const),
) {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  userId: string;

  @ApiProperty({
    description: 'API Key ID to Reveal',
    type: String,
  })
  apiKeyId: string;

  _id: string;
  createdAt: Date;
}
