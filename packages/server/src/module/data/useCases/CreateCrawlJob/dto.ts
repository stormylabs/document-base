import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsUrl, Max, Min } from 'class-validator';

export default class CreateCrawlJobDTO {
  @ApiProperty()
  @IsString({ each: true })
  @IsUrl(undefined, { each: true })
  @IsArray()
  urls: string[];

  @ApiProperty()
  @IsString()
  botId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(2000)
  limit: number;
}
