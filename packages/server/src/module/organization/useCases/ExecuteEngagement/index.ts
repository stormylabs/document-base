import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import ExecuteEngagementDTO from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobType } from '@/shared/interfaces';
import { EngagementQueuePayload } from '@/shared/interfaces/engagement';

type Response = Either<Result<UseCaseError>, Result<ExecuteEngagementDTO>>;

@Injectable()
export default class ExecuteEngagementUseCase {
  private readonly logger = new Logger(ExecuteEngagementUseCase.name);

  constructor(private readonly sqsMessageService: SqsMessageService) {}
  public async exec(
    engagementId: string,
    message: string,
    conversationHistory: string[],
  ): Promise<Response> {
    try {
      this.logger.log(`Start executing engagement`);

      await this.sendMessage({
        engagementId,
        message,
        conversationHistory,
      });

      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessage(payload: EngagementQueuePayload) {
    await this.sqsMessageService.sendMessage<EngagementQueuePayload>(
      JobType.Agent,
      payload,
    );
  }
}
