import { BotUsageResponse, ResourceUsageResponse } from '@/shared/dto/usage';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString } from 'class-validator';

export default class GetUsageByBotIdDTO {
  @IsDateString()
  @Transform((value) => new Date(value as unknown as string))
  from: Date;

  @IsDateString()
  @Transform((value) => new Date(value as unknown as string))
  to: Date;
}

export class GetUsageByUserIdResponseDTO {
  @ApiProperty({
    type: [BotUsageResponse],
  })
  bot: BotUsageResponse[];

  @ApiProperty({
    type: [ResourceUsageResponse],
  })
  resource: ResourceUsageResponse[];
}
