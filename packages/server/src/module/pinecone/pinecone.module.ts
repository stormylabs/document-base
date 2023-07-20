import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PineconeClientService } from './pinecone.service';

@Module({})
export class PineconeModule {
  static register(): DynamicModule {
    return {
      imports: [ConfigModule],
      module: PineconeModule,
      providers: [PineconeClientService],
      exports: [PineconeClientService],
    };
  }
}
