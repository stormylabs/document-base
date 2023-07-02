import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { errorHandler } from 'src/shared/http';
import CreateBotUseCase from '../useCases/bot/CreateBot';
import CreateBotDTO from '../useCases/bot/CreateBot/dto';

import { IdParams } from '@/shared/dto/IdParams';
import GetBotInfoUseCase from '../useCases/bot/GetBotInfo';
import MessageBotUseCase from '../useCases/bot/MessageBot';
import MessageBotDTO from '../useCases/bot/MessageBot/dto';
import UpdateBotInfoUseCase from '../useCases/bot/UpdateBotInfo';
import UpdateBotInfoDTO from '../useCases/bot/UpdateBotInfo/dto';
import SaveDocsAndTrainBotUseCase from '../useCases/bot/SaveDocsAndTrainBot';
import CrawlWebsitesByBotUseCase from '../useCases/bot/CrawlWebsitesByBotUseCase';
import SaveDocsAndTrainBotDTO from '../useCases/bot/SaveDocsAndTrainBot/dto';
import CrawlWebsitesByBotDTO from '../useCases/bot/CrawlWebsitesByBotUseCase/dto';

@ApiTags('bot')
@Controller('bot')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  constructor(
    private createBotUseCase: CreateBotUseCase,
    private updateBotInfoUseCase: UpdateBotInfoUseCase,
    private saveDocsAndTrainBotUseCase: SaveDocsAndTrainBotUseCase,
    private messageBotUseCase: MessageBotUseCase,
    private getBotInfoUseCase: GetBotInfoUseCase,
    private crawlWebsitesByBotUseCase: CrawlWebsitesByBotUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateBotDTO })
  @ApiOperation({
    summary: 'Creates a bot, name is set to default if not provided.',
  })
  async createBot(@Body() body: CreateBotDTO) {
    const { name } = body;
    this.logger.log(`[POST] Start creating bot`);
    const result = await this.createBotUseCase.exec(name);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] create bot error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Gets bot info by bot ID.',
  })
  async getBotInfo(@Param() { id }: IdParams) {
    this.logger.log(`[GET] Start getting bot`);
    const result = await this.getBotInfoUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(`[GET] get bot error ${error.errorValue().message}`);
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Patch(':id')
  @ApiParam({ name: 'Bot ID', type: String })
  @ApiBody({ type: UpdateBotInfoDTO })
  @ApiOperation({
    summary: 'Updates bot info by bot ID.',
  })
  async updateBot(@Param() { id }: IdParams, @Body() body: UpdateBotInfoDTO) {
    this.logger.log(`[PATCH] Start updating bot`);
    const result = await this.updateBotInfoUseCase.exec(id, body);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[PATCH] update bot error ${error.errorValue().message}`,
      );

      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Post('/train/:id')
  @ApiBody({ type: SaveDocsAndTrainBotDTO })
  @ApiOperation({
    summary: 'Saves documents to bot and train bot.',
  })
  async saveAndTrainBot(
    @Param() { id }: IdParams,
    @Body() body: SaveDocsAndTrainBotDTO,
  ) {
    this.logger.log(`[POST] Start indexing documents`);
    const { documentIds } = body;
    const result = await this.saveDocsAndTrainBotUseCase.exec(id, documentIds);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] index documents error ${error.errorValue().message}`,
      );

      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Post('/crawl/:id')
  @ApiBody({ type: CrawlWebsitesByBotDTO })
  @ApiOperation({
    summary: 'Saves documents to bot and train bot.',
  })
  async crawlWebsitesByBot(
    @Param() { id }: IdParams,
    @Body() body: CrawlWebsitesByBotDTO,
  ) {
    this.logger.log(`[POST] Start crawling websites`);
    const { urls, limit } = body;
    const result = await this.crawlWebsitesByBotUseCase.exec(id, urls, limit);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] crawl websites error ${error.errorValue().message}`,
      );

      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Post('/message/:id')
  @ApiBody({ type: MessageBotDTO })
  @ApiOperation({
    summary: 'Sends messages to bot, and get bot response.',
  })
  async messageBot(@Param() { id }: IdParams, @Body() body: MessageBotDTO) {
    const { message, conversationHistory } = body;
    this.logger.log(`[POST] Start messaging bot`);
    const result = await this.messageBotUseCase.exec(
      id,
      message,
      conversationHistory,
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] message bot error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }
}
