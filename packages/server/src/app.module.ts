import { Logger, Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { PineconeModule } from './module/pinecone/pinecone.module';
import { MongoDBModule } from './module/mongodb/mongodb.module';
import { BotModule } from './module/bot/bot.module';
import { SqsConsumerModule } from './module/sqsConsumer/sqsConsumer.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { FilesModule } from './module/files/files.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        PINECONE_API_KEY: Joi.string().required(),
        PINECONE_ENV: Joi.string().required(),
        PINECONE_INDEX: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string(),
        DOC_INDEX_QUEUE_NAME: Joi.string().required(),
        DOC_INDEX_QUEUE_URL: Joi.string().required(),
        WEB_CRAWL_QUEUE_NAME: Joi.string().required(),
        WEB_CRAWL_QUEUE_URL: Joi.string().required(),
        FILE_EXTRACT_QUEUE_NAME: Joi.string().required(),
        FILE_EXTRACT_QUEUE_URL: Joi.string().required(),
        SQS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
      }),
    }),
    MongoDBModule,
    PineconeModule,
    BotModule,
    SqsConsumerModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
