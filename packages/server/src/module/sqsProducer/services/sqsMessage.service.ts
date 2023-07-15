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
  async sendMessages<T>(id: string, job: JobType, payloads: T[]) {
    const messages: Message<T>[] = payloads.map((payload) => ({
      body: payload,
      groupId: id,
      id: uuid(),
    }));

    await this.sqsService.send(this.getQueueName(job), messages);
  }

  getQueueName(job: JobType) {
    if (job === 'web-crawl') {
      return this.config.get<string>('WEB_CRAWL_QUEUE_NAME');
    }

    if (job === 'file-extract') {
      return this.config.get<string>('FILE_EXTRACT_QUEUE_NAME');
    }

    return this.config.get<string>('DOC_INDEX_QUEUE_NAME');
  }
}
