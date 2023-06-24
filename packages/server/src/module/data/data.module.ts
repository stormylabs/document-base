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

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CrawlJob.name,
        schema: CrawlJobSchema,
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
  ],
  exports: [],
})
export class DataModule {}
