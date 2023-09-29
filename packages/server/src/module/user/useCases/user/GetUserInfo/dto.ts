import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserResponse } from '@/shared/dto/user';

export class GetUserResponse extends OmitType(UserResponse, [
  'deletedAt',
] as const) {}

export class GetUserInfoResponseDTO {
  @ApiProperty({
    type: GetUserResponse,
  })
  user: GetUserResponse;
}
