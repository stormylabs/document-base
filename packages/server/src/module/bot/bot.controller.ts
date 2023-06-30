import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ParamWithId from 'src/shared/dto/ParamWithId.dto';
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
  async getBotInfo(@Param() { id }: ParamWithId) {
    this.logger.log(`[GET] Start getting bot`);
    const result = await this.getBotInfoUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(`[GET] get bot error ${error.errorValue().message}`);
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Post('/message/:id')
  async messageBot(@Param() { id }: ParamWithId, @Body() body: MessageBotDTO) {
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

  @Post('/train/:id')
  @ApiOperation({ summary: 'Save and Train bot' })
  async saveAndTrainBot(
    @Param() { id }: ParamWithId,
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update bot ' })
  async updateBot(@Param() { id }: ParamWithId, @Body() body: UpdateBotDTO) {
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
}
