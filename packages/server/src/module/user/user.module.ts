import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './controllers/user.controller';
import CreateUserUseCase from './useCases/user/CreateUser';
import GetUserInfoUseCase from './useCases/user/GetUserInfo';
import CreateApiKeyUseCase from './useCases/apiKey/CreateApiKey';
import { ApiKeyService } from './services/apiKey.service';
import { ApiKeyRepository } from './repositories/apiKey.repository';
import { ApiKey, ApiKeySchema } from './schemas/apiKey.schema';
import RevealAPIKeyUseCase from './useCases/apiKey/RevealApiKey';
import DeleteApiKeyUseCase from './useCases/apiKey/DeleteApiKey';
import GetApiKeyIdsUseCase from './useCases/apiKey/GetApiKeyIds';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ApiKey.name,
        schema: ApiKeySchema,
      },
    ]),
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    ApiKeyRepository,
    UserService,
    ApiKeyService,
    CreateUserUseCase,
    GetUserInfoUseCase,
    CreateApiKeyUseCase,
    RevealAPIKeyUseCase,
    DeleteApiKeyUseCase,
    GetApiKeyIdsUseCase,
  ],
  exports: [UserService, CreateUserUseCase],
})
export class UserModule {}
