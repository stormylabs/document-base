import { Body, Controller, Logger, Post, Get, Query } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import ChatAssistUseCase from './useCases/ChatAssist';
import ChatAssistDTO from './useCases/ChatAssist/dto';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import CreateCrawlJobDTO from './useCases/CreateCrawlJob/dto';
import GetCrawlJobStatusDTO from './useCases/GetCrawlJobStatus/dto';
import GetCrawlJobStatusUseCase from './useCases/GetCrawlJobStatus';

@Controller('/data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private createCrawlJobUseCase: CreateCrawlJobUseCase,
    private getCrawlJobStatusUseCase: GetCrawlJobStatusUseCase,
    private chatAssistUseCase: ChatAssistUseCase,
  ) {
    this.getCrawlJobStatusUseCase = getCrawlJobStatusUseCase;
    this.createCrawlJobUseCase = createCrawlJobUseCase;
    this.chatAssistUseCase = chatAssistUseCase;
  }

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

  @Post('/chat-assist')
  async chatAssist(@Body() body: ChatAssistDTO) {
    const { query, conversationHistory, numOfAnswers, tag } = body;
    this.logger.log(`[POST] Start chat assist`);
    const result = await this.chatAssistUseCase.exec(
      query,
      conversationHistory,
      numOfAnswers,
      tag,
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] chat assist error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }
}
