import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { SqsConsumerService } from './services/sqsConsumer.service';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DataModule),
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          consumers: [
            {
              name: config.get<string>('SQS_QUEUE_NAME'),
              queueUrl: config.get<string>('SQS_QUEUE_URL'),
              region: config.get<string>('SQS_REGION'),
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [SqsConsumerService],
  exports: [SqsConsumerService],
})
export class SqsConsumerModule {
  constructor(private configService: ConfigService) {}
  onModuleInit() {
    const config = new AWS.Config();
    config.update({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    });
  }
}
