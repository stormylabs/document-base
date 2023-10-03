import { OrganizationResponse } from '@/shared/dto/organization';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CreateOrganizationDTO {
  @ApiProperty({
    description: 'Name of the Organization',
    minLength: 1,
    maxLength: 320,
    required: true,
    default: 'default',
    example: 'StorMy Org',
    type: String,
  })
  @MaxLength(320)
  @MinLength(1)
  @IsNotEmpty()
  name: string;
}

export class CreateOrganizationResponseDto extends OmitType(
  OrganizationResponse,
  ['deletedAt', 'members'] as const,
) {}
