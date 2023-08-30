import { ApiKeyResponse } from '@/shared/dto/apiKey';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class ApiKeyResponseDTO extends PartialType(
  PickType(ApiKeyResponse, ['_id', 'createdAt'] as const),
) {
  _id: string;
  createdAt: Date;
}

export class GetApiKeyIDsResponseDTO {
  @ApiProperty({
    type: Array<ApiKeyResponseDTO>,
  })
  apiKeys: ApiKeyResponseDTO[];
}
