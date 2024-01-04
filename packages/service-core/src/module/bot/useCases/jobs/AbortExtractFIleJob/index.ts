import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  AbortJobError,
  NotFoundError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { AbortExtractFileJobResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';

type Response = Either<
  Result<UseCaseError>,
  Result<AbortExtractFileJobResponseDTO>
>;

@Injectable()
export default class AbortExtractFileJobUseCase {
  private readonly logger = new Logger(AbortExtractFileJobUseCase.name);
  constructor(private readonly extractFileJobService: ExtractFileJobService) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start aborting extract file job`);

      const extractFileJob = await this.extractFileJobService.findById(jobId);

      if (!extractFileJob)
        return left(new NotFoundError(Resource.ExtractFileJob, [jobId]));

      if (
        ![JobStatus.Pending, JobStatus.Running].includes(extractFileJob.status)
      ) {
        return left(new AbortJobError([jobId], JobType.FileExtract));
      }

      const updatedExtractFileJob =
        await this.extractFileJobService.updateStatus(jobId, JobStatus.Aborted);

      const {
        documents,
        status,
        updatedAt,
        createdAt,
        bot: botId,
        initUrls,
      } = updatedExtractFileJob;

      this.logger.log(`Extract file job is aborted successfully`);

      return right(
        Result.ok({
          jobId,
          botId,
          status,
          updatedAt,
          createdAt,
          progress: Math.floor((documents.length / initUrls.length) * 100),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
