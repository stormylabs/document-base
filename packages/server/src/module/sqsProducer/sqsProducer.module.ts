import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.SQS_REGION, // aws region
  accessKeyId: process.env.AWS_ACCESS_KEY, // aws access key id
  secretAccessKey: process.env.AWS_SECRET_KEY, // aws secret access key
});

@Module({
  imports: [
    SqsModule.registerAsync({
      consumers: [],
      producers: [],
    }),
  ],
  controllers: [],
})
export class SqsProducerModule {}
