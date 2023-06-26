import { Logger, Module } from '@nestjs/common';
import * as Joi from 'joi';
import { DataModule } from './module/data/data.module';
import { ConfigModule } from '@nestjs/config';
import { PineconeModule } from './module/pinecone/pinecone.module';
import { MongoDBModule } from './module/mongodb/mongodb.module';
import { BotModule } from './module/bot/bot.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        PINECONE_API_KEY: Joi.string().required(),
        PINECONE_ENV: Joi.string().required(),
        PINECONE_INDEX: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
      }),
    }),
    MongoDBModule,
    DataModule,
    PineconeModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
