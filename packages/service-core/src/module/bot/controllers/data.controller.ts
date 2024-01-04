import {
  Controller,
  Logger,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { errorHandler } from 'src/shared/http';

import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IdParams } from '@/shared/dto/IdParams';
import GetCrawlJobStatusUseCase from '../useCases/jobs/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from '../useCases/jobs/GetDocIndexJobStatus';
import { GetCrawlJobStatusResponseDTO } from '../useCases/jobs/GetCrawlJobStatus/dto';
import { GetTrainJobStatusResponseDTO } from '../useCases/jobs/GetDocIndexJobStatus/dto';
import GetExtractFileJobStatusUseCase from '../useCases/jobs/GetExtractFileJobStatus';
import { GetExtractFileJobStatusResponseDTO } from '../useCases/jobs/GetExtractFileJobStatus/dto';
import { AbortCrawlJobResponseDTO } from '../useCases/jobs/AbortCrawlJob/dto';
import AbortCrawlJobUseCase from '../useCases/jobs/AbortCrawlJob';
import { AbortExtractFileJobResponseDTO } from '../useCases/jobs/AbortExtractFIleJob/dto';
import AbortExtractFileJobUseCase from '../useCases/jobs/AbortExtractFIleJob';
import AbortDocIndexJobUseCase from '../useCases/jobs/AbortDocIndexJob';
import { AbortTrainJobResponseDTO } from '../useCases/jobs/AbortDocIndexJob/dto';
import { ApiKeyGuard } from '@/shared/guards/ApiKey.guard';
import { JobOwnershipGuard } from '../useCases/jobs/JobOwnershipGuard';

@ApiTags('data')
@Controller('data')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
    private getExtractFileJobStatusUseCase: GetExtractFileJobStatusUseCase,
    private abortCrawlJobUseCase: AbortCrawlJobUseCase,
    private abortExtractFileJobUseCase: AbortExtractFileJobUseCase,
    private abortDocIndexJobUseCase: AbortDocIndexJobUseCase,
  ) {}

  @Get('/crawl/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Get crawl job status by job ID.',
  })
  @ApiOkResponse({
    description: 'Crawl job status',
    type: GetCrawlJobStatusResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot or crawl job not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getCrawlJobStatus(@Param() { id }: IdParams) {
    this.logger.log(`[GET] Start getting crawl job status`);
    const result = await this.getCrawlJobStatusUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get crawl job status error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Post('/crawl/abort/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Abort crawl job by job ID.',
  })
  @ApiOkResponse({
    description: 'Aborted crawl job',
    type: AbortCrawlJobResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Crawl Job not found',
  })
  @ApiConflictResponse({
    description: `The jobId is not in 'running' or 'pending' statuses.`,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async abortCrawlJob(@Param() { id }: IdParams) {
    this.logger.log(`[POST] Start aborting crawl job`);
    const result = await this.abortCrawlJobUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] abort crawl job error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Get('/train/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Get train job status by job ID.',
  })
  @ApiOkResponse({
    description: 'Train job status',
    type: GetTrainJobStatusResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot or train job not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getTrainJobStatus(@Param() { id }: IdParams) {
    this.logger.log(`[GET] Start getting DocIndex job status`);
    const result = await this.getDocIndexJobStatusUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get DocIndex job status error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Post('/train/abort/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Abort train job by job ID.',
  })
  @ApiOkResponse({
    description: 'Aborted train job',
    type: AbortTrainJobResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Abort train Job not found',
  })
  @ApiConflictResponse({
    description: `The jobId is not in 'running' or 'pending' statuses.`,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async abortDocIndexJob(@Param() { id }: IdParams) {
    this.logger.log(`[POST] Start aborting doc index job`);
    const result = await this.abortDocIndexJobUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] abort doc index job error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Get('/extract/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Get extract file job status by job ID.',
  })
  @ApiOkResponse({
    description: 'Extract file job status',
    type: GetExtractFileJobStatusResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot or extract file job not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getFileExtractJobStatus(@Param() { id }: IdParams) {
    this.logger.log(`[GET] Start getting extract file job status`);
    const result = await this.getExtractFileJobStatusUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] Get extract file job status error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Post('/extract/abort/:id')
  @UseGuards(JobOwnershipGuard)
  @ApiOperation({
    summary: 'Abort extract file job by job ID.',
  })
  @ApiOkResponse({
    description: 'Aborted extract file job',
    type: AbortExtractFileJobResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Extract file Job not found',
  })
  @ApiConflictResponse({
    description: `The jobId is not in 'running' or 'pending' statuses.`,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async abortExtractFileJob(@Param() { id }: IdParams) {
    this.logger.log(`[POST] Start aborting extract file job`);
    const result = await this.abortExtractFileJobUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] abort extract file job error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }
}
