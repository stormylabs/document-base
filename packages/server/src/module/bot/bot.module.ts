import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './bot.controller';
import { BotRepository } from './repository/bot.repository';
import { Bot, BotSchema } from './schemas/Bot.schema';
import { BotService } from './services/bot.service';
import CreateBotUseCase from './useCases/CreateBot';

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
  providers: [BotRepository, BotService, CreateBotUseCase],
  exports: [BotService],
})
export class BotModule {}
