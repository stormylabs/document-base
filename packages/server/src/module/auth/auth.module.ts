import { ApiKeyGuard } from '@/shared/guards/ApiKeyGuard.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { ApiKeyRepository } from './repositories/apiKey.repository';
import { ApiKey, ApiKeySchema } from './schemas/apiKey.schema';
import { ApiKeyService } from './services/apiKey.service';
import CreateApiKeyUseCase from './useCases/apiKey/CreateApiKey';
import DeleteApiKeyUseCase from './useCases/apiKey/DeleteApiKey';
import GetApiKeyIdsUseCase from './useCases/apiKey/GetApiKeyIds';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ApiKey.name,
        schema: ApiKeySchema,
      },
    ]),
    UserModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    ApiKeyRepository,
    ApiKeyService,
    CreateApiKeyUseCase,
    DeleteApiKeyUseCase,
    GetApiKeyIdsUseCase,
    ApiKeyGuard,
  ],
  exports: [ApiKeyService],
})
export class AuthModule {}
