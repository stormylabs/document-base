import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  AbortJobError,
  NotFoundError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { AbortTrainJobResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { BotService } from '@/module/bot/services/bot.service';

type Response = Either<Result<UseCaseError>, Result<AbortTrainJobResponseDTO>>;

@Injectable()
export default class AbortDocIndexJobUseCase {
  private readonly logger = new Logger(AbortDocIndexJobUseCase.name);
  constructor(
    private readonly docIndexJobService: DocIndexJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start aborting doc index job`);

      const docIndexJob = await this.docIndexJobService.findById(jobId);

      if (!docIndexJob)
        return left(new NotFoundError(Resource.DocIndexJob, [jobId]));

      if (
        ![JobStatus.Pending, JobStatus.Running].includes(docIndexJob.status)
      ) {
        return left(new AbortJobError([jobId], JobType.DocIndex));
      }

      const updatedExtractFileJob = await this.docIndexJobService.updateStatus(
        jobId,
        JobStatus.Aborted,
      );
      this.logger.log(`Index doc job is aborted successfully`);

      const {
        documents: jobDocs,
        status,
        updatedAt,
        createdAt,
        bot: botId,
      } = updatedExtractFileJob;

      const bot = await this.botService.findById(botId);

      const progress =
        jobDocs.length === 0
          ? 0
          : Math.floor((jobDocs.length / bot.documents.length) * 100);

      return right(
        Result.ok({
          jobId,
          botId,
          status,
          updatedAt,
          createdAt,
          progress,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
