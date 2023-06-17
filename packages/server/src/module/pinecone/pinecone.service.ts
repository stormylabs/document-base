import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

@Injectable()
export class PineconeClientService implements OnModuleInit {
  private readonly logger = new Logger(PineconeClientService.name);

  async onModuleInit() {
    await this.initClient();
    await this.initIndex();
  }

  public index: VectorOperationsApi;
  public client: PineconeClient = new PineconeClient();

  private async initClient() {
    try {
      await this.client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENV,
      });
      this.logger.log(`Connected to pinecone`);
    } catch (error) {
      this.logger.error(`Error connecting to pinecone`);
      throw error;
    }
  }

  private async initIndex() {
    const index = process.env.PINECONE_INDEX;
    const indexList = await this.client.listIndexes();
    if (!indexList.includes(index)) {
      try {
        await this.client.createIndex({
          createRequest: {
            name: index,
            dimension: 1536,
            metric: 'cosine',
            podType: 's1',
          },
        });
        this.logger.log(`Created pinecone index: "${index}"`);
      } catch (error) {
        this.logger.error(
          `Error creating index: "${index}", check your pinecone account.`,
          'PineconeClient',
        );
        throw error;
      }
    }
    this.index = this.client.Index(index);
    this.logger.log(`Pinecone index: "${index}" is ready,`);
  }
}
