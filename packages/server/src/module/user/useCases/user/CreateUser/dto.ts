import { UserResponse } from '@/shared/dto/user';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CreateUserDTO {
  @ApiProperty({
    description: 'Email of the user',
    minLength: 1,
    maxLength: 320,
    required: true,
    default: 'default',
    example: 'example@example.com',
    type: String,
  })
  @IsEmail()
  @MaxLength(320)
  @MinLength(1)
  @IsNotEmpty()
  email: string;
}

export class CreateUserResponse extends OmitType(UserResponse, [
  'deletedAt',
  'createdAt',
  'updatedAt',
] as const) {}

export class CreateUserResponseDTO {
  @ApiProperty({
    type: CreateUserResponse,
  })
  user: Omit<UserResponse, 'deletedAt' | 'updatedAt' | 'createdAt'>;
}
