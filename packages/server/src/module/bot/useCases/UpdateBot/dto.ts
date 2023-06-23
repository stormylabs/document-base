import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class UpdateBotDTO {
  // name is required for update
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  name: string;

  // @ApiProperty({
  //   example: ['649449f39c815dc47cbe6425'],
  // })
  // @IsArray()
  // @IsOptional()
  // documents: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  crawlJobId: string;
}
