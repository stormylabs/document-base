import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from '../bot/bot.module';
import { PineconeModule } from '../pinecone/pinecone.module';
import { SqsProducerModule } from '../sqsProducer/sqsProducer.module';
import { DataController } from './data.controller';
import { CrawlJobService } from './services/crawlJob.service';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import { CrawlJob, CrawlJobSchema } from './schemas/crawlJob.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlJobRepository } from './repositories/crawlJob.repository';
import { Bot, BotSchema } from '../bot/schemas/bot.schema';
import { Document, DocumentSchema } from '../bot/schemas/document.schema';
import { BotService } from '../bot/services/bot.service';
import { BotRepository } from '../bot/repositories/bot.repository';
import { DocumentService } from '../bot/services/document.service';
import { DocumentRepository } from '../bot/repositories/document.repository';
import { SqsMessageService } from '../sqsProducer/services/sqsMessage.service';
import { SqsConsumerService } from '../sqsConsumer/services/sqsConsumer.service';
import CrawlWebsiteUseCase from './useCases/CrawlWebsite';
import GetCrawlJobStatusUseCase from './useCases/GetCrawlJobStatus';
import IndexDocumentUseCase from './useCases/IndexDocuments';
import { DocIndexJobService } from './services/docIndexJob.service';
import { DocIndexJobRepository } from './repositories/docIndexJob.repository';
import { DocIndexJob, DocIndexJobSchema } from './schemas/docIndexJob.schema';
import CreateDocIndexJobUseCase from './useCases/CreateDocIndexJob';
import GetDocIndexJobStatusUseCase from './useCases/GetDocIndexJobStatus';
import { LangChainModule } from '../langChain/langChain.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CrawlJob.name,
        schema: CrawlJobSchema,
      },
      {
        name: DocIndexJob.name,
        schema: DocIndexJobSchema,
      },
      {
        name: Document.name,
        schema: DocumentSchema,
      },
      {
        name: Bot.name,
        schema: BotSchema,
      },
    ]),
    PineconeModule.register(),
    ConfigModule,
    BotModule,
    SqsProducerModule,
    LangChainModule,
  ],
  controllers: [DataController],
  providers: [
    CreateCrawlJobUseCase,
    GetCrawlJobStatusUseCase,
    CrawlJobService,
    CrawlJobRepository,
    BotService,
    BotRepository,
    DocumentService,
    DocumentRepository,
    SqsMessageService,
    SqsConsumerService,
    CrawlWebsiteUseCase,
    IndexDocumentUseCase,
    DocIndexJobService,
    DocIndexJobRepository,
    CreateDocIndexJobUseCase,
    GetDocIndexJobStatusUseCase,
  ],
  exports: [
    CrawlWebsiteUseCase,
    IndexDocumentUseCase,
    CreateDocIndexJobUseCase,
  ],
})
export class DataModule {}
