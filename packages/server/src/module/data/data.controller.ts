import { Controller, Get, Logger, Query } from '@nestjs/common';
import { errorHandler } from 'src/shared/http';
import CrawlWebsitesUseCase from './useCases/CrawlWebsite';
import CrawlWebsitesDTO from './useCases/CrawlWebsite/dto';

@Controller('/data')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(private crawlWebsiteUseCase: CrawlWebsitesUseCase) {
    this.crawlWebsiteUseCase = crawlWebsiteUseCase;
  }

  @Get('/crawl')
  async indexQueries(@Query() query: CrawlWebsitesDTO) {
    const { urls, limit, summarize } = query;
    this.logger.log(`[GET] Start crawling websites`);
    const result = await this.crawlWebsiteUseCase.exec(urls, limit, summarize);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] crawl websites error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return;
  }
}
