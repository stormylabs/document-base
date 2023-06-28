import { Body, Controller, Logger, Post } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import ChatAssistUseCase from './useCases/ChatAssist';
import ChatAssistDTO from './useCases/ChatAssist/dto';
import CreateCrawlJobUseCase from './useCases/CreateCrawlJob';
import CreateCrawlJobDTO from './useCases/CreateCrawlJob/dto';

@Controller('/data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private createCrawlJobUseCase: CreateCrawlJobUseCase,
    private chatAssistUseCase: ChatAssistUseCase,
  ) {
    this.createCrawlJobUseCase = createCrawlJobUseCase;
    this.chatAssistUseCase = chatAssistUseCase;
  }

  @Post('/crawl')
  async createCrawlJob(@Body() body: CreateCrawlJobDTO) {
    const { urls, limit, botId } = body;
    this.logger.log(`[GET] Start creating crawl job`);
    const result = await this.createCrawlJobUseCase.exec(botId, urls, limit);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] create crawl job error ${error.errorValue().message}`,
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
