import { DOCUMENT_LIMIT } from '@/shared/constants';
import { OrganizationResponse } from '@/shared/dto/organization';
import { KnowledgeBaseType } from '@/shared/interfaces';
import { ApiProperty, getSchemaPath, OmitType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CrawlDTO {
  @ApiProperty({
    description: 'URLs to crawl',
    minItems: 1,
    maxItems: 10,
    required: true,
    type: [String],
    pattern: '^https://.*$',
    example:
      'https://www.atlassian.com/blog/productivity/simple-ways-to-be-productive-at-work',
  })
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  urls: string[];

  @ApiProperty({
    description: 'Max number of URLs to crawl',
    minimum: 1,
    maximum: DOCUMENT_LIMIT,
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(DOCUMENT_LIMIT)
  limit: number;

  @ApiProperty({
    description: 'Flag to specify only to crawl the links provided',
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  only: boolean;
}

export default class AddKnowledgeBaseToOrganizationDTO {
  @ApiProperty({
    description: 'Name of the knowledge base',
    minLength: 1,
    maxLength: 320,
    required: true,
    default: 'default',
    example: 'Stormy Labs Knowledge',
    type: String,
  })
  @MaxLength(320)
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Knowledge base type',
    enum: KnowledgeBaseType,
    required: true,
  })
  @IsEnum(KnowledgeBaseType)
  type: KnowledgeBaseType;

  @ApiProperty({
    description: 'Description on knowledge base',
    maxLength: 1500,
    required: false,
    type: String,
  })
  @IsOptional()
  @MaxLength(1500)
  description: string;

  @ApiProperty({
    description: 'Crawl job of knowledge Base',
    type: () => CrawlDTO,
    oneOf: [{ $ref: getSchemaPath(CrawlDTO) }],
    required: false,
    title: 'CrawlJobDTO',
  })
  @IsOptional()
  crawl: CrawlDTO;

  @ApiProperty({
    type: 'array', // 👈  array of files
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Files of the bot',
  })
  @IsOptional()
  files: Array<Express.Multer.File>;
}

export class CreateOrganizationResponseDto extends OmitType(
  OrganizationResponse,
  ['deletedAt'] as const,
) {}
