import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';

import CreateUserDTO, {
  CreateUserResponseDTO,
} from '../useCases/user/CreateUser/dto';
import CreateUserUseCase from '../useCases/user/CreateUser';
import { GetUserInfoResponseDTO } from '../useCases/user/GetUserInfo/dto';
import { IdParams } from '@/shared/dto/IdParams';
import GetUserInfoUseCase from '../useCases/user/GetUserInfo';

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserInfoUseCase: GetUserInfoUseCase,
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
}
