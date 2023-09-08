import { BotUsageResponse, ResourceUsageResponse } from '@/shared/dto/usage';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export default class GetUsageByBotIdDTO {
  @IsNumber()
  @Type(() => Number)
  from: number;

  @IsNumber()
  @Type(() => Number)
  to: number;
}

export class GetUsageByBotIdResponseDTO {
  bot: {
    usages: BotUsageResponse[];
    costs: number;
  };

  resource: { usages: ResourceUsageResponse[]; costs: number };
  total: number;
}
