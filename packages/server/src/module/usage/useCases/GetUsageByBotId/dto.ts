import { BotUsageResponse, ResourceUsageResponse } from '@/shared/dto/usage';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export default class GetUsageByBotIdDTO {
  @ApiProperty({
    name: 'from',
    type: Date,
    description: 'From date',
    example: '2023-06-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  from: Date;

  @ApiProperty({
    name: 'to',
    type: Date,
    description: 'To date',
    example: '2023-11-25T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  to: Date;
}

export class GetUsageByBotIdResponseDTO {
  bot: {
    usages: BotUsageResponse[];
    costs: number;
  };

  resource: { usages: ResourceUsageResponse[]; costs: number };
  total: number;
}
