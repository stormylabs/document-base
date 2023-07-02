import { Controller, Logger, Get, Param } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdParams } from '@/shared/dto/IdParams';
import GetCrawlJobStatusUseCase from '../useCases/jobs/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from '../useCases/jobs/GetDocIndexJobStatus';

@ApiTags('data')
@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
  ) {}

  @Get('/crawl/:id')
  @ApiOperation({
    summary: 'Get crawl job status by job ID.',
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

  @Get('/train/:id')
  @ApiOperation({
    summary: 'Get train job status by job ID.',
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
}
