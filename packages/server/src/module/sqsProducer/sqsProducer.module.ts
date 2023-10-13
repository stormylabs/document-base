import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SqsMessageService } from './services/sqsMessage.service';

@Module({
  imports: [
    ConfigModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          producers: [
            {
              name: config.get<string>('WEB_CRAWL_QUEUE_NAME'),
              queueUrl: config.get<string>('WEB_CRAWL_QUEUE_URL'),
              region: config.get<string>('SQS_REGION'),
            },
            {
              name: config.get<string>('WEB_CRAWL_ORG_QUEUE_NAME'),
              queueUrl: config.get<string>('WEB_CRAWL_ORG_QUEUE_URL'),
              region: config.get<string>('SQS_REGION'),
            },
            {
              name: config.get<string>('DOC_INDEX_QUEUE_NAME'),
              queueUrl: config.get<string>('DOC_INDEX_QUEUE_URL'),
              region: config.get<string>('SQS_REGION'),
            },
            {
              name: config.get<string>('FILE_EXTRACT_QUEUE_NAME'),
              queueUrl: config.get<string>('FILE_EXTRACT_QUEUE_URL'),
              region: config.get<string>('SQS_REGION'),
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [SqsMessageService],
  exports: [SqsMessageService],
})
export class SqsProducerModule {}
