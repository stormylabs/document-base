import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorHandler } from '@/shared/http';
import GetUsageByBotIdDTO from '../useCases/GetUsageByBotId/dto';
import { GetUsageByUserIdResponseDTO } from '../useCases/GetUsageByUserId/dto';
import GetUsageByUserIdUseCase from '../useCases/GetUsageByUserId';
import { InternalApiKeyGuard } from '@/shared/guards/InternalApiKey.guard';
import { UserIdParams } from '@/shared/dto/user';

@ApiTags('a26b81b5-a896-4dea-91cc-5d4dacf3dc74/usage')
@Controller('a26b81b5-a896-4dea-91cc-5d4dacf3dc74/usage')
@ApiSecurity('x-api-key')
@UseGuards(InternalApiKeyGuard)
export class DataUsageController {
  private readonly logger = new Logger(DataUsageController.name);
  constructor(private getUsageByUserIdUseCase: GetUsageByUserIdUseCase) {}

  @Get(':userId')
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
    @Param() { userId }: UserIdParams,
  ) {
    this.logger.log(`[GET] Start getting usage by user id: ${userId}`);
    const result = await this.getUsageByUserIdUseCase.exec(
      userId,
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
