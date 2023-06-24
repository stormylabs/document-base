import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeModule } from '../pinecone/pinecone.module';

import { DataController } from './data.controller';
import ChatAssistUseCase from './useCases/ChatAssist';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';

@Module({
  imports: [PineconeModule.register(), ConfigModule],
  controllers: [DataController],
  providers: [CreateCrawlJobUseCase, ChatAssistUseCase, PineconeClient],
  exports: [],
})
export class DataModule {}
