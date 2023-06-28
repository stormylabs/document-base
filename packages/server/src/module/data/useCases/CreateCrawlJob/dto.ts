import { IsArray, IsNumber, IsString, IsUrl, Max, Min } from 'class-validator';

export default class CreateCrawlJobDTO {
  @IsString({ each: true })
  @IsUrl(undefined, { each: true })
  @IsArray()
  urls: string[];

  @IsString()
  botId: string;

  @IsNumber()
  @Min(1)
  @Max(2000)
  limit: number;
}
