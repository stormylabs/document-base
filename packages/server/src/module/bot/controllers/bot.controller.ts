import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';
import CreateBotUseCase from '../useCases/bot/CreateBot';
import CreateBotDTO, {
  CreateBotResponseDTO,
} from '../useCases/bot/CreateBot/dto';

import { IdParams } from '@/shared/dto/IdParams';
import GetBotInfoUseCase from '../useCases/bot/GetBotInfo';
import MessageBotUseCase from '../useCases/bot/MessageBot';
import MessageBotDTO, {
  MessageBotResponseDTO,
} from '../useCases/bot/MessageBot/dto';
import UpdateBotInfoUseCase from '../useCases/bot/UpdateBotInfo';
import UpdateBotInfoDTO, {
  UpdateBotInfoResponseDTO,
} from '../useCases/bot/UpdateBotInfo/dto';
import SaveDocsAndTrainBotUseCase from '../useCases/bot/SaveDocsAndTrainBot';
import CrawlWebsitesByBotUseCase from '../useCases/bot/CrawlWebsitesByBotUseCase';
import SaveDocsAndTrainBotDTO, {
  SaveDocsAndTrainBotResponseDTO,
} from '../useCases/bot/SaveDocsAndTrainBot/dto';
import {
  CrawlWebsitesByBotDTO,
  CrawlWebsitesByBotResponseDTO,
} from '../useCases/bot/CrawlWebsitesByBotUseCase/dto';
import { GetBotInfoResponseDTO } from '../useCases/bot/GetBotInfo/dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import ExtractFilesByByBotDTO, {
  ExtractFilesByBotResponseDTO,
} from '../useCases/bot/ExtractFilesByBotUseCase/dto';
import ExtractFilesByBotUseCase from '../useCases/bot/ExtractFilesByBotUseCase';

import { CustomUploadFileMimeTypeValidator } from '@/shared/validators/file-mimetype.validator';
import { ParseFilePipe } from '@nestjs/common';
import { CustomFileCountValidationPipe } from '@/shared/validators/file-count.pipe';
import { DeleteBotResponseDTO } from '../useCases/bot/DeleteBot/dto';
import DeleteBotUseCase from '../useCases/bot/DeleteBot';

const ALLOWED_UPLOADS_EXT_TYPES = ['.doc', '.docx', '.pdf'];
const MAX_FILE_COUNT = 10;
const MIN_FILE_COUNT = 1;

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
    private extractFilesByBotUseCase: ExtractFilesByBotUseCase,
    private deleteBotUseCase: DeleteBotUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateBotDTO })
  @ApiOperation({
    summary: 'Creates a bot, name is set to default if not provided.',
  })
  @ApiCreatedResponse({
    description: 'Created bot info',
    type: CreateBotResponseDTO,
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
  @ApiOkResponse({
    description: 'Get bot info',
    type: GetBotInfoResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
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
  @ApiBody({ type: UpdateBotInfoDTO })
  @ApiOkResponse({
    description: 'Bot info',
    type: UpdateBotInfoResponseDTO,
  })
  @ApiOperation({
    summary: 'Updates bot info by bot ID.',
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
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
  @ApiOkResponse({
    description: 'Train Job id and status',
    type: SaveDocsAndTrainBotResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot or document not found',
  })
  @ApiConflictResponse({
    description:
      'If there are unfinished web crawl jobs or train jobs, this error will be returned.',
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
    summary: 'Crawl websites by bot.',
  })
  @ApiOkResponse({
    description: 'Crawl Job id and status',
    type: CrawlWebsitesByBotResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
  })
  @ApiConflictResponse({
    description:
      'If there are unfinished web crawl jobs or train jobs, this error will be returned.',
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
  @ApiOkResponse({
    description: 'Message bot response',
    type: MessageBotResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
  })
  @ApiConflictResponse({
    description:
      'If there are unfinished train jobs, this error will be returned.',
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

  @Post('/extract/:id')
  @ApiBody({ type: ExtractFilesByByBotDTO })
  @ApiOperation({
    summary: 'Extract files by bot.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOkResponse({
    description: 'Extract Files By Bot',
    type: ExtractFilesByBotResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
  })
  @ApiConflictResponse({
    description:
      'If there are unfinished train jobs, this error will be returned.',
  })
  async extractFilesByBot(
    @Param() { id }: IdParams,
    @UploadedFiles(
      new CustomFileCountValidationPipe({
        minCount: MIN_FILE_COUNT,
        maxCount: MAX_FILE_COUNT,
      }),
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileMimeTypeValidator({
            fileExtensions: ALLOWED_UPLOADS_EXT_TYPES,
          }),
        )
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
      new ParseFilePipe({
        validators: [],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    this.logger.log(`[POST] Start uploading and extracting files`);

    const result = await this.extractFilesByBotUseCase.exec(id, files);

    if (result.isLeft()) {
      const error = result.value;

      this.logger.error(
        `[POST] extract files error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete bot by bot ID',
  })
  @ApiConsumes('application/json')
  @ApiOkResponse({
    description: 'Delete bot by bot ID',
    type: DeleteBotResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Bot not found',
  })
  async deleteBot(@Param() { id }: IdParams) {
    this.logger.log(`[DELETE] Start deleting bot`);

    const result = await this.deleteBotUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;

      this.logger.error(
        `[DELETE] Delete bot error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }
}
