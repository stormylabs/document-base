import { OrganizationResponse } from '@/shared/dto/organization';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export default class CreateOrganizationDTO {
  @ApiProperty({
    description: 'Name of the Organization',
    minLength: 1,
    maxLength: 320,
    required: true,
    default: 'default',
    example: 'Stormy Labs Limited',
    type: String,
  })
  @MaxLength(320)
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Organization Descriptions',
    minLength: 1,
    maxLength: 2500,
    required: true,
    default:
      'Stormy Labs Limited is a software company that builds software for the future, we specialize developing AI business solutions for our clients.',
    type: String,
  })
  @MaxLength(2500)
  @MinLength(1)
  descriptions: string;

  @ApiProperty({
    description: 'Organization Values',
    minLength: 1,
    maxLength: 1500,
    required: true,
    default:
      'We strive to provide the best software solutions for our clients, we are a team of highly skilled software engineers and we are always ready to take on new challenges.',
    type: String,
  })
  @MaxLength(1500)
  @MinLength(1)
  values: string;
}

export class CreateOrganizationResponseDto extends OmitType(
  OrganizationResponse,
  ['deletedAt', 'members'] as const
) {}
