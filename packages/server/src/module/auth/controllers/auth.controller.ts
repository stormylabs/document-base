import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';

import CreateApiKeyUseCase from '../../auth/useCases/apiKey/CreateApiKey';
import { CreateApiKeyResponseDTO } from '../../auth/useCases/apiKey/CreateApiKey/dto';
import { RevealAPIKeyParams, UserIdParams } from '@/shared/dto/user';
import DeleteApiKeyUseCase from '../../auth/useCases/apiKey/DeleteApiKey';
import GetApiKeyIdsUseCase from '../../auth/useCases/apiKey/GetApiKeyIds';
import { GetApiKeyIDsResponseDTO } from '../../auth/useCases/apiKey/GetApiKeyIds/dto';
import { Response } from 'express';

@Controller('a26b81b5-a896-4dea-91cc-5d4dacf3dc74/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private createApiKeyUseCase: CreateApiKeyUseCase,
    private deleteApiKeyUseCase: DeleteApiKeyUseCase,
    private getApiKeyIdsUseCase: GetApiKeyIdsUseCase,
  ) {}

  @Post('/:userId/api-keys')
  @ApiOperation({
    summary: 'Creates an API Key',
  })
  @ApiCreatedResponse({
    description: 'Created API Key',
    type: CreateApiKeyResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async createApiKey(@Param() { userId }: UserIdParams) {
    this.logger.log(`[POST] Start creating API Key`);
    const result = await this.createApiKeyUseCase.exec(userId);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] create API Key error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    return result.value.getValue();
  }

  @Delete('/:userId/api-keys/:apiKeyId')
  @ApiOperation({
    summary: 'Delete API Key',
  })
  @ApiNoContentResponse({
    description: 'API Key Deleted',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'API Key ID not found',
  })
  async deleteApiKey(
    @Param() { userId, apiKeyId }: RevealAPIKeyParams,
    @Res() @Res() res: Response,
  ) {
    this.logger.log(`[DELETE] Start deleting API Key`);
    const result = await this.deleteApiKeyUseCase.exec({
      userId,
      apiKeyId,
    });

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[DELETE] delete API Key error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('/:userId/api-keys')
  @ApiOperation({
    summary: 'Get API Keys by User Id',
  })
  @ApiOkResponse({
    description: 'API Keys',
    type: GetApiKeyIDsResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async getApiKeys(@Param() { userId }: UserIdParams) {
    this.logger.log(`[GET] Start getting API Keys by UserId`);
    const result = await this.getApiKeyIdsUseCase.exec({
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(`[GET] API Keys error ${error.errorValue().message}`);
      return errorHandler(error);
    }

    return result.value.getValue();
  }
}
