import {
  Body,
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
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';

import CreateUserDTO, {
  CreateUserResponseDTO,
} from '../useCases/user/CreateUser/dto';
import CreateUserUseCase from '../useCases/user/CreateUser';
import { GetUserInfoResponseDTO } from '../useCases/user/GetUserInfo/dto';
import { IdParams } from '@/shared/dto/IdParams';
import GetUserInfoUseCase from '../useCases/user/GetUserInfo';
import CreateApiKeyUseCase from '../useCases/apiKey/CreateApiKey';
import { CreateApiKeyResponseDTO } from '../useCases/apiKey/CreateApiKey/dto';
import { RevealAPIKeyParams, UserIdParams } from '@/shared/dto/user';
import DeleteApiKeyUseCase from '../useCases/apiKey/DeleteApiKey';
import GetApiKeyIdsUseCase from '../useCases/apiKey/GetApiKeyIds';
import { GetApiKeyIDsResponseDTO } from '../useCases/apiKey/GetApiKeyIds/dto';
import { Response } from 'express';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserInfoUseCase: GetUserInfoUseCase,
    private createApiKeyUseCase: CreateApiKeyUseCase,
    private deleteApiKeyUseCase: DeleteApiKeyUseCase,
    private getApiKeyIdsUseCase: GetApiKeyIdsUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateUserDTO })
  @ApiOperation({
    summary: 'Creates a user',
  })
  @ApiCreatedResponse({
    description: 'Created user info',
    type: CreateUserResponseDTO,
  })
  @ApiConflictResponse({
    description: 'Email already exists.',
  })
  async createUser(@Body() body: CreateUserDTO) {
    const { email } = body;
    this.logger.log(`[POST] Start creating user`);
    const result = await this.createUserUseCase.exec(email);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] create user error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Gets user info by user ID.',
  })
  @ApiOkResponse({
    description: 'Get user info',
    type: GetUserInfoResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async getUserInfo(@Param() { id }: IdParams) {
    this.logger.log(`[GET] Start getting user info`);
    const result = await this.getUserInfoUseCase.exec(id);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(`[GET] get user error ${error.errorValue().message}`);
      return errorHandler(error);
    }
    return result.value.getValue();
  }

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
