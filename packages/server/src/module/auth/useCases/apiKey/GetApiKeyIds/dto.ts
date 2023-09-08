import { ApiKeyResponse } from '@/shared/dto/apiKey';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class ApiKeyResponseDTO extends PartialType(
  PickType(ApiKeyResponse, ['_id', 'apiKey', 'createdAt'] as const),
) {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  userId: string;

  _id: string;
  apiKey: string;
  createdAt: Date;
}

export class GetApiKeyIDsResponseDTO {
  @ApiProperty({
    type: [ApiKeyResponseDTO],
  })
  apiKeys: ApiKeyResponseDTO[];
}
