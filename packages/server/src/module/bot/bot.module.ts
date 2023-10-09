import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './controllers/bot.controller';
import { BotRepository } from './repositories/bot.repository';
import { Bot, BotSchema } from './schemas/bot.schema';
import { BotService } from './services/bot.service';
import CreateBotUseCase from './useCases/bot/CreateBot';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentService } from './services/document.service';
import { DocumentSchema, Document } from './schemas/document.schema';
import { PineconeModule } from '../pinecone/pinecone.module';
import { PineconeClientService } from '../pinecone/pinecone.service';
import { ConfigModule } from '@nestjs/config';
import { LangChainModule } from '../langChain/langChain.module';
import GetBotInfoUseCase from './useCases/bot/GetBotInfo';
import MessageBotUseCase from './useCases/bot/MessageBot';
import UpdateBotUseCase from './useCases/bot/UpdateBotInfo';
import CrawlWebsiteUseCase from './useCases/jobs/CrawlWebsite';
import CreateCrawlJobUseCase from './useCases/jobs/CreateCrawlJob';
import CreateDocIndexJobUseCase from './useCases/jobs/CreateDocIndexJob';
import GetCrawlJobStatusUseCase from './useCases/jobs/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from './useCases/jobs/GetDocIndexJobStatus';
import IndexDocumentUseCase from './useCases/jobs/IndexDocuments';
import MarkJobsAsFinishedUseCase from './useCases/jobs/MarkJobsAsFinished';
import { CrawlJobService } from './services/crawlJob.service';
import { DocIndexJobService } from './services/docIndexJob.service';
import { SqsConsumerModule } from '../sqsConsumer/sqsConsumer.module';
import { SqsProducerModule } from '../sqsProducer/sqsProducer.module';
import { CrawlJob, CrawlJobSchema } from './schemas/crawlJob.schema';
import { DocIndexJob, DocIndexJobSchema } from './schemas/docIndexJob.schema';
import { DataController } from './controllers/data.controller';
import { SqsConsumerService } from '../sqsConsumer/services/sqsConsumer.service';
import { SqsMessageService } from '../sqsProducer/services/sqsMessage.service';
import { CrawlJobRepository } from './repositories/crawlJob.repository';
import { DocIndexJobRepository } from './repositories/docIndexJob.repository';
import SaveDocsAndTrainBotUseCase from './useCases/bot/SaveDocsAndTrainBot';
import CrawlWebsitesByBotUseCase from './useCases/bot/CrawlWebsitesByBotUseCase';
import { S3Module } from '../s3/s3.module';
import ExtractFilesByBotUseCase from './useCases/bot/ExtractFilesByBotUseCase';
import ExtractFileUseCase from './useCases/jobs/ExtractFile';
import { ExtractFileJobService } from './services/extractFileJob.service';
import { ExtractFileJobRepository } from './repositories/extractFileJob.repository';
import {
  ExtractFileJob,
  ExtractFileJobSchema,
} from './schemas/extractFileJob.schema';
import CreateExtractFileJobUseCase from './useCases/jobs/CreateExtractFileJob';
import GetExtractFileJobStatusUseCase from './useCases/jobs/GetExtractFileJobStatus';
import DeleteBotUseCase from './useCases/bot/DeleteBot';
import AbortCrawlJobUseCase from './useCases/jobs/AbortCrawlJob';
import AbortExtractFileJobUseCase from './useCases/jobs/AbortExtractFIleJob';
import AbortDocIndexJobUseCase from './useCases/jobs/AbortDocIndexJob';
import { AuthModule } from '../auth/auth.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Document.name,
        schema: DocumentSchema,
      },
      {
        name: Bot.name,
        schema: BotSchema,
      },
      {
        name: CrawlJob.name,
        schema: CrawlJobSchema,
      },
      {
        name: DocIndexJob.name,
        schema: DocIndexJobSchema,
      },
      {
        name: ExtractFileJob.name,
        schema: ExtractFileJobSchema,
      },
    ]),
    PineconeModule.register(),
    ConfigModule,
    LangChainModule,
    SqsProducerModule,
    SqsConsumerModule,
    S3Module,
    AuthModule,
    UsageModule,
  ],
  controllers: [BotController, DataController],
  providers: [
    BotRepository,
    BotService,
    DocumentRepository,
    CreateBotUseCase,
    GetBotInfoUseCase,
    UpdateBotUseCase,
    SaveDocsAndTrainBotUseCase,
    CrawlWebsiteUseCase,
    MessageBotUseCase,
    PineconeClientService,
    CreateCrawlJobUseCase,
    GetCrawlJobStatusUseCase,
    CrawlJobService,
    CrawlJobRepository,
    DocumentService,
    SqsMessageService,
    SqsConsumerService,
    IndexDocumentUseCase,
    DocIndexJobService,
    DocIndexJobRepository,
    CreateDocIndexJobUseCase,
    GetDocIndexJobStatusUseCase,
    MarkJobsAsFinishedUseCase,
    CrawlWebsitesByBotUseCase,
    ExtractFileUseCase,
    ExtractFilesByBotUseCase,
    ExtractFileJobService,
    ExtractFileJobRepository,
    CreateExtractFileJobUseCase,
    GetExtractFileJobStatusUseCase,
    DeleteBotUseCase,
    AbortCrawlJobUseCase,
    AbortExtractFileJobUseCase,
    AbortDocIndexJobUseCase,
  ],
  exports: [
    BotService,
    CrawlWebsiteUseCase,
    ExtractFileUseCase,
    IndexDocumentUseCase,
    DocumentService,
  ],
})
export class BotModule {}
