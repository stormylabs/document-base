import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PineconeClient } from '@pinecone-database/pinecone';
import { BotModule } from '../bot/bot.module';
import { PineconeModule } from '../pinecone/pinecone.module';
import { SqsProducerModule } from '../sqsProducer/sqsProducer.module';
import { DataController } from './data.controller';
import { CrawlJobService } from './services/crawlJob.service';
import ChatAssistUseCase from './useCases/ChatAssist';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import { CrawlJob, CrawlJobSchema } from './schemas/crawlJob.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlJobRepository } from './repositories/crawlJob.repository';
import { Bot, BotSchema } from '../bot/schemas/Bot.schema';
import { Document, DocumentSchema } from '../bot/schemas/document.schema';
import { BotService } from '../bot/services/bot.service';
import { BotRepository } from '../bot/repositories/bot.repository';
import { DocumentService } from '../bot/services/document.service';
import { DocumentRepository } from '../bot/repositories/document.repository';
import { SqsMessageService } from '../sqsProducer/services/sqsMessage.service';
import { SqsConsumerService } from '../sqsConsumer/services/sqsConsumer.service';
import CrawlWebsiteUseCase from './useCases/CrawlWebsite';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CrawlJob.name,
        schema: CrawlJobSchema,
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
  ],
  controllers: [DataController],
  providers: [
    CreateCrawlJobUseCase,
    ChatAssistUseCase,
    PineconeClient,
    CrawlJobService,
    CrawlJobRepository,
    BotService,
    BotRepository,
    DocumentService,
    DocumentRepository,
    SqsMessageService,
    SqsConsumerService,
    CrawlWebsiteUseCase,
  ],
  exports: [CrawlWebsiteUseCase],
})
export class DataModule {}
