import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { Message } from '@ssut/nestjs-sqs/dist/sqs.types';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';
import { JobType } from 'aws-sdk/clients/importexport';

@Injectable()
export class SqsMessageService {
  constructor(
    private readonly sqsService: SqsService,
    private readonly config: ConfigService,
  ) {}
  async sendMessage<T>(id: string, job: JobType, body: T) {
    const message: Message<T> = { body, groupId: id, id: uuid() };
    await this.sqsService.send(this.getQueueName(job), message);
  }

  getQueueName(job: JobType) {
    if (job === 'web-crawl') {
      return this.config.get<string>('WEB_CRAWL_QUEUE_NAME');
    }
    return this.config.get<string>('DOC_INDEX_QUEUE_NAME');
  }
}
