import { EngagementResponse } from '@/shared/dto/engagement';
import { OmitType } from '@nestjs/swagger';

export class GetEngagementResponseDto extends OmitType(EngagementResponse, [
  'deletedAt',
  'templateId',
] as const) {}
