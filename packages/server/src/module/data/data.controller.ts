import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import ChatAssistUseCase from './useCases/ChatAssist';
import ChatAssistDTO from './useCases/ChatAssist/dto';
import CrawlWebsitesUseCase from './useCases/CreateCrawlJob';
import CrawlWebsitesDTO from './useCases/CreateCrawlJob/dto';

@Controller('/data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(
    private crawlWebsiteUseCase: CrawlWebsitesUseCase,
    private chatAssistUseCase: ChatAssistUseCase,
  ) {
    this.crawlWebsiteUseCase = crawlWebsiteUseCase;
    this.chatAssistUseCase = chatAssistUseCase;
  }

  @Get('/crawl')
  async indexQueries(@Query() query: CrawlWebsitesDTO) {
    const { urls, limit, tag, summarize } = query;
    this.logger.log(`[GET] Start crawling websites`);
    const result = await this.crawlWebsiteUseCase.exec(
      urls,
      limit,
      tag,
      summarize,
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] crawl websites error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
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
