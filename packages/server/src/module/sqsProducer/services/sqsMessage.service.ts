import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { Message } from '@ssut/nestjs-sqs/dist/sqs.types';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';
import { JobType } from '@/shared/interfaces';

@Injectable()
export class SqsMessageService {
  constructor(
    private readonly sqsService: SqsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Send Messages
   * @param id entity id could be orgId or botId
   * @param job
   * @param payloads
   */
  async sendMessages<T>(id: string, job: JobType, payloads: T[]) {
    const messages: Message<T>[] = payloads.map((payload) => ({
      body: payload,
      groupId: id,
      id: uuid(),
    }));

    await this.sqsService.send(this.getQueueName(job), messages);
  }

  getQueueName(job: JobType) {
    if (job === JobType.WebCrawl) {
      return this.config.get<string>('WEB_CRAWL_QUEUE_NAME');
    }

    if (job === JobType.WebCrawlOrg) {
      return this.config.get<string>('WEB_CRAWL_ORG_QUEUE_NAME');
    }

    if (job === JobType.FileExtract) {
      return this.config.get<string>('FILE_EXTRACT_QUEUE_NAME');
    }

    return this.config.get<string>('DOC_INDEX_QUEUE_NAME');
  }
}
