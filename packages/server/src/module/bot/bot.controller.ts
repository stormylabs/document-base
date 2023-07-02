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
import CreateBotUseCase from './useCases/CreateBot';
import CreateBotDTO from './useCases/CreateBot/dto';
import UpdateBotInfoUseCase from './useCases/UpdateBotInfo';
import UpdateBotDTO from './useCases/UpdateBotInfo/dto';
import SaveAndIndexDocsUseCase from './useCases/SaveAndIndexDocs';
import SaveAndIndexDocsDTO from './useCases/SaveAndIndexDocs/dto';
import MessageBotDTO from './useCases/MessageBot/dto';
import MessageBotUseCase from './useCases/MessageBot';
import GetBotInfoUseCase from './useCases/GetBotInfo';
import { IdParams } from '@/shared/dto/IdParams';

@ApiTags('bot')
@Controller('bot')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  constructor(
    private createBotUseCase: CreateBotUseCase,
    private updateBotInfoUseCase: UpdateBotInfoUseCase,
    private saveAndIndexDocsUseCase: SaveAndIndexDocsUseCase,
    private messageBotUseCase: MessageBotUseCase,
    private getBotInfoUseCase: GetBotInfoUseCase,
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
  @ApiBody({ type: UpdateBotDTO })
  @ApiOperation({
    summary: 'Updates bot info by bot ID.',
  })
  async updateBot(@Param() { id }: IdParams, @Body() body: UpdateBotDTO) {
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
  @ApiBody({ type: SaveAndIndexDocsDTO })
  @ApiOperation({
    summary: 'Saves documents to bot and train bot.',
  })
  async saveAndTrainBot(
    @Param() { id }: IdParams,
    @Body() body: SaveAndIndexDocsDTO,
  ) {
    this.logger.log(`[POST] Start indexing documents`);
    const { documentIds } = body;
    const result = await this.saveAndIndexDocsUseCase.exec(id, documentIds);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] index documents error ${error.errorValue().message}`,
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
