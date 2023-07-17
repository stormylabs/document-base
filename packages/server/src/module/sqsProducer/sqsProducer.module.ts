import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
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
export class SqsProducerModule {
  constructor(private configService: ConfigService) {}
  onModuleInit() {
    const config = new AWS.Config();
    config.update({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }
}
