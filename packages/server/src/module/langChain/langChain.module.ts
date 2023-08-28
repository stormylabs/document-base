import { Module } from '@nestjs/common';

import { LangChainService } from './services/langChain.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: async (config: ConfigService) => {
        const configuration = {
          openAIApiKey: config.get('OPENAI_API_KEY'),
          streaming: true,
          verbose: true,
          modelName: 'gpt-3.5-turbo',
          temperature: 0,
        };
        return new ChatOpenAI(configuration);
      },
      inject: [ConfigService],
    },
    {
      provide: OpenAIEmbeddings,
      useFactory: async (config: ConfigService) => {
        const configuration = {
          modelName: 'text-embedding-ada-002',
          openAIApiKey: config.get('OPENAI_API_KEY'),
        };
        return new OpenAIEmbeddings(configuration);
      },
      inject: [ConfigService],
    },
    {
      provide: OpenAI,
      useFactory: async (config: ConfigService) => {
        const configuration = {
          modelName: 'gpt-3.5-turbo',
          openAIApiKey: config.get('OPENAI_API_KEY'),
          temperature: 0,
        };
        return new OpenAI(configuration);
      },
      inject: [ConfigService],
    },
    LangChainService,
  ],
  exports: [LangChainService],
})
export class LangChainModule {}
