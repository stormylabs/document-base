import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  ResourceUsage,
  ResourceUsageSchema,
} from './schemas/resourceUsage.schema';
import { ResourceUsageRepository } from './repositories/resourceUsage.repository';
import { ResourceUsageService } from './services/resourceUsage.service';
import { UsageController } from './controllers/usage.controller';
import { BotUsageRepository } from './repositories/botUsage.repository';
import { BotUsageService } from './services/botUsage.service';
import { BotUsage, BotUsageSchema } from './schemas/botUsage.schema';
import { AuthModule } from '../auth/auth.module';
import GetUsageByBotIdUseCase from './useCases/GetUsageByBotId';
import GetUsageByUserIdUseCase from './useCases/GetUsageByUserId';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ResourceUsage.name,
        schema: ResourceUsageSchema,
      },
      {
        name: BotUsage.name,
        schema: BotUsageSchema,
      },
    ]),
    ConfigModule,
    AuthModule,
  ],
  controllers: [UsageController],
  providers: [
    ResourceUsageRepository,
    BotUsageRepository,
    ResourceUsageService,
    BotUsageService,
    GetUsageByBotIdUseCase,
    GetUsageByUserIdUseCase,
  ],
  exports: [BotUsageService, ResourceUsageService],
})
export class UsageModule {}
