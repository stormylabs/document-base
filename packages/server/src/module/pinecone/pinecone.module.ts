import { DynamicModule, Module } from '@nestjs/common';
import { PineconeClientService } from './pinecone.service';

@Module({})
export class PineconeModule {
  static register(): DynamicModule {
    return {
      module: PineconeModule,
      providers: [PineconeClientService],
      exports: [PineconeClientService],
    };
  }
}
