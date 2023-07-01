import { Body, Controller, Logger, Post, Get, Param } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import CreateCrawlJobDTO from './useCases/CreateCrawlJob/dto';
import GetCrawlJobStatusUseCase from './useCases/GetCrawlJobStatus';
import GetDocIndexJobStatusUseCase from './useCases/GetDocIndexJobStatus';
import { ApiTags } from '@nestjs/swagger';
import ParamWithId from '@/shared/dto/ParamWithId.dto';

@ApiTags('data')
@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private createCrawlJobUseCase: CreateCrawlJobUseCase,
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private getDocIndexJobStatusUseCase: GetDocIndexJobStatusUseCase,
  ) {}

  @Post('/crawl/:id')
  async createCrawlJob(
    @Param() { id }: ParamWithId,
    @Body() body: CreateCrawlJobDTO,
  ) {
    const { urls, limit } = body;
    this.logger.log(`[POST] Start creating crawl job`);
    const result = await this.createCrawlJobUseCase.exec(id, urls, limit);

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
  async getCrawlJobStatus(@Param() { id }: ParamWithId) {
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
  async getTrainJobStatus(@Param() { id }: ParamWithId) {
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
