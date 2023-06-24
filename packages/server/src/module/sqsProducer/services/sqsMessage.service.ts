import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { Message } from '@ssut/nestjs-sqs/dist/sqs.types';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';

@Injectable()
export class SqsMessageService {
  constructor(
    private readonly sqsService: SqsService,
    private readonly config: ConfigService,
  ) {}
  async sendMessage<T>(id: string, body: T) {
    const message: Message<T> = { body, groupId: id, id: uuid() };
    await this.sqsService.send(
      this.config.get<string>('SQS_QUEUE_NAME'),
      message,
    );
  }
}
