import { Controller, Logger, Get, Param, Post } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';

import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IdParams } from '@/shared/dto/IdParams';
import GetCrawlJobStatusUseCase from '../useCases/jobs/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from '../useCases/jobs/GetDocIndexJobStatus';
import { GetCrawlJobStatusResponseDTO } from '../useCases/jobs/GetCrawlJobStatus/dto';
import { GetDocIndexJobStatusResponseDTO } from '../useCases/jobs/GetDocIndexJobStatus/dto';
import GetExtractFileJobStatusUseCase from '../useCases/jobs/GetExtractFileJobStatus';
import { GetExtractFileJobStatusResponseDTO } from '../useCases/jobs/GetExtractFileJobStatus/dto';
import { AbortCrawlJobResponseDTO } from '../useCases/jobs/AbortCrawlJob/dto';
import AbortCrawlJobUseCase from '../useCases/jobs/AbortCrawlJob';

@ApiTags('data')
@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
    private getExtractFileJobStatusUseCase: GetExtractFileJobStatusUseCase,
    private abortCrawlJobUseCase: AbortCrawlJobUseCase,
  ) {}

  @Get('/crawl/:id')
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
  @ApiOperation({
    summary: 'Get train job status by job ID.',
  })
  @ApiOkResponse({
    description: 'Train job status',
    type: GetDocIndexJobStatusResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot or train job not found',
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

  @Get('/extract/:id')
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
}
