import { Body, Controller, Logger, Post, Get, Param } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import CreateCrawlJobDTO from './useCases/CreateCrawlJob/dto';
import GetCrawlJobStatusUseCase from './useCases/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from './useCases/GetDocIndexJobStatus';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { IdParams } from '@/shared/dto/IdParams';

@ApiTags('data')
@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private createCrawlJobUseCase: CreateCrawlJobUseCase,
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
  ) {}

  @Post('/crawl')
  @ApiBody({ type: CreateCrawlJobDTO })
  @ApiOperation({
    summary: 'Create jobs to crawl URLs to be attached to bot as documents.',
  })
  async createCrawlJob(@Body() body: CreateCrawlJobDTO) {
    const { urls, limit, botId } = body;
    this.logger.log(`[POST] Start creating crawl job`);
    const result = await this.createCrawlJobUseCase.exec(botId, urls, limit);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] create crawl job error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

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
  @ApiParam({ name: 'Train Job ID', type: String })
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
