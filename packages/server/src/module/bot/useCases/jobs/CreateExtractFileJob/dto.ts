import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUrl,
} from 'class-validator';

export default class CreateExtractFileJobDTO {
  @ApiProperty({
    description: 'Bot ID',
    required: true,
    type: String,
  })
  @IsString()
  botId: string;

  @ApiProperty({
    description: 'URLs files to extract',
    minItems: 1,
    maxItems: 10,
    required: true,
    type: [String],
    pattern: '^https://.*$',
  })
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  urls: string[];
}
