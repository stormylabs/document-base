import { UserResponse } from '@/shared/dto/user';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CreateUserDTO {
  @ApiProperty({
    description: 'Email of the user',
    minLength: 1,
    maxLength: 64,
    required: false,
    default: 'default',
    example: 'foo@example.com',
    type: String,
  })
  @IsEmail()
  @MaxLength(64)
  @MinLength(1)
  @IsNotEmpty()
  email?: string;
}

export class CreateUserResponseDTO {
  // TODO: fix Omit UserResponse issue that displaying the bot schema as response
  // @ApiProperty({
  //   type: OmitType(UserResponse, ['deletedAt'] as const),
  // })
  // user: Omit<UserResponse, 'deletedAt'>;

  @ApiProperty({
    type: () => UserResponse,
  })
  user: UserResponse;
}
