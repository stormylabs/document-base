import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';

import CreateUserDTO, {
  CreateUserResponseDTO,
} from '../useCases/user/CreateUser/dto';
import CreateUserUseCase from '../useCases/user/CreateUser';

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private createUserUseCase: CreateUserUseCase) {}

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
}
