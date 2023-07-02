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

export default class CreateCrawlJobDTO {
  @ApiProperty({
    description: 'URLs to crawl',
    minItems: 1,
    maxItems: 10,
    required: true,
    type: [String],
  })
  @IsString({ each: true })
  @IsUrl(undefined, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  urls: string[];

  @ApiProperty({
    description: 'Max number of URLs to crawl',
    minimum: 1,
    maximum: 2000,
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(2000)
  limit: number;
}
