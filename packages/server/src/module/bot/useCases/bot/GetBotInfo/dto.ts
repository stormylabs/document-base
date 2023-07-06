import { JobStatus } from '@/shared/interfaces';
import { CrawlJobResponse } from '@/shared/dto/crawlJob';
import { DocumentType } from '@/shared/interfaces/document';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { DocumentResponse } from '@/shared/dto/document';
import { DocIndexJobResponse } from '@/shared/dto/docIndexJob';
import { BotResponse } from '@/shared/dto/bot';

class GetBotDocResponse extends PartialType(
  PickType(DocumentResponse, ['_id', 'sourceName', 'type'] as const),
) {
  _id: string;
  sourceName: string;
  type: DocumentType;
  @ApiProperty({
    type: Number,
    required: true,
  })
  tokens: number;
}

class GetBotCrawlJobResponse extends PartialType(
  PickType(CrawlJobResponse, ['_id', 'status', 'createdAt'] as const),
) {
  _id: string;
  status: JobStatus;
  createdAt: Date;
}

class GetBotDocIndexJobResponse extends PartialType(
  PickType(DocIndexJobResponse, ['_id', 'status', 'createdAt'] as const),
) {
  _id: string;
  status: JobStatus;
  createdAt: Date;
}

class GetBotResponse extends PartialType(
  PickType(BotResponse, ['_id', 'name', 'createdAt'] as const),
) {
  _id: string;
  name: string;
  createdAt: Date;

  @ApiProperty({
    type: () => [GetBotDocResponse],
    isArray: true,
    required: true,
  })
  documents: GetBotDocResponse[];

  @ApiProperty({
    type: () => [GetBotDocIndexJobResponse],
    isArray: true,
    required: true,
  })
  trainJobs: GetBotDocIndexJobResponse[];
  @ApiProperty({
    type: () => [GetBotCrawlJobResponse],
    isArray: true,
    required: true,
  })
  crawlJobs: GetBotCrawlJobResponse[];
}

export class GetBotInfoResponseDTO {
  @ApiProperty({
    type: GetBotResponse,
  })
  bot: GetBotResponse;
}
