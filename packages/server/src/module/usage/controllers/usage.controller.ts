import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import GetUsageByBotIdUseCase from '../useCases/GetUsageByBotId';
import { ApiKeyGuard } from '@/shared/guards/ApiKeyGuard.guard';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IdParams } from '@/shared/dto/IdParams';
import { errorHandler } from '@/shared/http';
import GetUsageByBotIdDTO, {
  GetUsageByBotIdResponseDTO,
} from '../useCases/GetUsageByBotId/dto';
import { GetUsageByUserIdResponseDTO } from '../useCases/GetUsageByUserId/dto';
import GetUsageByUserIdUseCase from '../useCases/GetUsageByUserId';
import { AuthRequest } from '@/shared/interfaces';

@Controller('usage')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class UsageController {
  private readonly logger = new Logger(UsageController.name);
  constructor(
    private getUsageByBotIdUseCase: GetUsageByBotIdUseCase,
    private getUsageByUserIdUseCase: GetUsageByUserIdUseCase,
  ) {}

  @Get('/bot/:id')
  @ApiOperation({
    summary: 'Gets usage by bot id.',
  })
  @ApiOkResponse({
    description: 'Get usage by bot id successfully',
    type: GetUsageByBotIdResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getUsageByBotId(
    @Param() { id }: IdParams,
    @Query() { from, to }: GetUsageByBotIdDTO,
  ) {
    this.logger.log(`[GET] Start getting usage by bot id`);
    const result = await this.getUsageByBotIdUseCase.exec(
      id,
      new Date(from),
      new Date(to),
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get usage by bot id error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Get('')
  @ApiOperation({
    summary: 'Gets usage by user id.',
  })
  @ApiOkResponse({
    description: 'Get usage by user id successfully',
    type: GetUsageByUserIdResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getUsageByUserId(
    @Query() { from, to }: GetUsageByBotIdDTO,
    @Req() req: AuthRequest,
  ) {
    this.logger.log(`[GET] Start getting usage by user id: ${req.user._id}`);
    const result = await this.getUsageByUserIdUseCase.exec(
      req.user._id,
      new Date(from),
      new Date(to),
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get usage by user id error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }
}
