import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdParams {
  @ApiProperty({ name: 'id', type: String })
  @IsString()
  id: string;
}
