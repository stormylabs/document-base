import { Logger, Module } from '@nestjs/common';
import { DataModule } from './module/data/data.module';
import { ConfigModule } from '@nestjs/config';
import { PineconeModule } from './module/pinecone/pinecone.module';

@Module({
  imports: [PineconeModule, ConfigModule.forRoot(), DataModule],
  providers: [Logger],
})
export class AppModule {}
