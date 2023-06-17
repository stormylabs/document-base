import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export default class CrawlWebsitesDTO {
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) => value.split(','))
  urls: string[];

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(2000)
  limit: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  summarize: boolean;
}
