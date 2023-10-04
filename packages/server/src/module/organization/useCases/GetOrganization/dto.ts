import { OrganizationResponse } from '@/shared/dto/organization';
import { OmitType } from '@nestjs/swagger';

export class GetOrganizationResponseDto extends OmitType(OrganizationResponse, [
  'deletedAt',
] as const) {}
