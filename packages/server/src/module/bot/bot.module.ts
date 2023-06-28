import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './bot.controller';
import { BotRepository } from './repositories/bot.repository';
import { Bot, BotSchema } from './schemas/bot.schema';
import { BotService } from './services/bot.service';
import CreateBotUseCase from './useCases/CreateBot';
import UpdateBotUseCase from './useCases/UpdateBotInfo';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bot.name,
        schema: BotSchema,
      },
    ]),
  ],
  controllers: [BotController],
  providers: [BotRepository, BotService, CreateBotUseCase, UpdateBotUseCase],
  exports: [BotService],
})
export class BotModule {}
