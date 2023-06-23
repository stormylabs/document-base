import { Body, Controller, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ParamWithId from 'src/shared/dto/ParamWithId.dto';
import { errorHandler } from 'src/shared/http';
import CreateBotUseCase from './useCases/CreateBot';
import CreateBotDTO from './useCases/CreateBot/dto';
import UpdateBotUseCase from './useCases/Update';

@ApiTags('bots')
@Controller('bots')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  constructor(
    private createBotUseCase: CreateBotUseCase,
    private updateBotUseCase: UpdateBotUseCase,
  ) {
    this.createBotUseCase = createBotUseCase;
  }

  @Post()
  async indexQueries(@Body() body: CreateBotDTO) {
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update bot ' })
  async updateBot(@Param() { id }: ParamWithId, @Body() body: CreateBotDTO) {
    const { name } = body;
    this.logger.log(`[PATCH] Start updating bot`);
    const result = await this.updateBotUseCase.exec(id, name);

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
