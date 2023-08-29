import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';

import { BotService } from '@/module/bot/services/bot.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { GetExtractFileJobStatusResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { Resource } from '@/shared/interfaces';

type Response = Either<
  Result<UseCaseError>,
  Result<GetExtractFileJobStatusResponseDTO>
>;

@Injectable()
export default class GetExtractFileJobStatusUseCase {
  private readonly logger = new Logger(GetExtractFileJobStatusUseCase.name);
  constructor(
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly botService: BotService,
  ) {}
  public async exec(jobId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting extract file job status`);

      const extractFileJob = await this.extractFileJobService.findById(jobId);

      if (!extractFileJob)
        return left(new NotFoundError(Resource.ExtractFileJob, [jobId]));

      const {
        status,
        bot: botId,
        createdAt,
        updatedAt,
        initUrls,
        documents,
      } = extractFileJob;

      this.logger.log(`Get extract file job successfully`);
      return right(
        Result.ok({
          jobId,
          botId,
          status,
          createdAt,
          updatedAt,
          progress: Math.floor((documents.length / initUrls.length) * 100),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
