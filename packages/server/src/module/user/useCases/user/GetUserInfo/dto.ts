import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { UserResponse } from '@/shared/dto/user';

class GetUserResponse extends PartialType(
  PickType(UserResponse, ['_id', 'email', 'createdAt', 'updatedAt'] as const),
) {
  _id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserInfoResponseDTO {
  @ApiProperty({
    type: GetUserResponse,
  })
  user: GetUserResponse;
}
