import { Body, Controller, Logger, Post, Get, Query } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import CreateCrawlJobDTO from './useCases/CreateCrawlJob/dto';
import GetCrawlJobStatusDTO from './useCases/GetCrawlJobStatus/dto';
import GetCrawlJobStatusUseCase from './useCases/GetCrawlJobStatus';
import GetDocIndexJobStatusDTO from './useCases/GetDocIndexJobStatus/dto';
import GetDocIndexJobStatusUseCase from './useCases/GetDocIndexJobStatus';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('data')
@Controller('/data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private createCrawlJobUseCase: CreateCrawlJobUseCase,
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
  ) {}

  @Post('/crawl')
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

  @Get('/crawl')
  async getCrawlJobStatus(@Query() query: GetCrawlJobStatusDTO) {
    const { jobId } = query;
    this.logger.log(`[GET] Start getting crawl job status`);
    const result = await this.getCrawlJobStatusUseCase.exec(jobId);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get crawl job status error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Get('/train')
  async getTrainJobStatus(@Query() query: GetDocIndexJobStatusDTO) {
    const { jobId } = query;
    this.logger.log(`[GET] Start getting DocIndex job status`);
    const result = await this.getDocIndexJobStatusUseCase.exec(jobId);

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
