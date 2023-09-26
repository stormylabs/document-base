import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class InviteUserToOrganizationDTO {
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
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'organization ID',
    minLength: 1,
    maxLength: 50,
    required: true,
    type: String,
  })
  @MaxLength(50)
  @MinLength(1)
  @IsNotEmpty()
  organizationId: string;
}
