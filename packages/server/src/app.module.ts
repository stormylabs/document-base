import { Logger, Module } from '@nestjs/common';
import * as Joi from 'joi';
import { DataModule } from './module/data/data.module';
import { ConfigModule } from '@nestjs/config';
import { PineconeModule } from './module/pinecone/pinecone.module';
import { MongoDBModule } from './module/mongodb/mongodb.module';

@Module({
  imports: [
    PineconeModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        PINECONE_API_KEY: Joi.string().required(),
        PINECONE_ENV: Joi.string().required(),
        PINECONE_INDEX: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    DataModule,
    MongoDBModule,
  ],
  providers: [Logger],
})
export class AppModule {}
