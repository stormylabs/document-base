import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class InviteMemberToOrganizationDTO {
  @ApiProperty({
    description: 'Email of the user',
    minLength: 1,
    maxLength: 50,
    required: true,
    example: 'example@example.com',
    type: String,
  })
  @MaxLength(50)
  @MinLength(1)
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
