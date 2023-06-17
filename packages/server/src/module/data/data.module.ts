import { Module } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeModule } from '../pinecone/pinecone.module';

import { DataController } from './data.controller';
import CrawlWebsitesUseCase from './useCases/CrawlWebsite';

@Module({
  imports: [PineconeModule.register()],
  controllers: [DataController],
  providers: [CrawlWebsitesUseCase, PineconeClient],
  exports: [],
})
export class DataModule {}
