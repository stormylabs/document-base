import { DOCUMENT_LIMIT } from '@/shared/constants';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
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

  @ApiProperty({
    description: 'Max number of URLs file to extract',
    minimum: 1,
    maximum: DOCUMENT_LIMIT,
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(DOCUMENT_LIMIT)
  limit: number;
}
