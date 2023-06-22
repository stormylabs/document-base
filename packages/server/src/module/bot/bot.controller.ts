import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { errorHandler } from 'src/shared/http';
import CreateBotUseCase from './useCases/CreateBot';
import CreateBotDTO from './useCases/CreateBot/dto';

@Controller('/bot')
export class BotController {
  private readonly logger = new Logger(BotController.name);
  constructor(private createBotUseCase: CreateBotUseCase) {
    this.createBotUseCase = createBotUseCase;
  }

  @Post('bot')
  @ApiOperation({
    summary: 'create bot use case',
  })
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
}
