import { Logger, Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { PineconeModule } from './module/pinecone/pinecone.module';
import { MongoDBModule } from './module/mongodb/mongodb.module';
import { BotModule } from './module/bot/bot.module';
import { SqsConsumerModule } from './module/sqsConsumer/sqsConsumer.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerAsyncModule } from './module/throttler/throttler.module';

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
        SQS_REGION: Joi.string().required(),
        THROTTLE_TTL: Joi.string().required(),
        THROTTLE_LIMIT: Joi.string().required(),
      }),
    }),
    ThrottlerAsyncModule,
    MongoDBModule,
    PineconeModule,
    BotModule,
    SqsConsumerModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
