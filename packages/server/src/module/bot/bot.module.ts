import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotRepository } from './repos/Bot.repo';
import CreateBotUseCase from './useCases/CreateBot';
import { BotService } from './services/Bot.service';
import { BotController } from './bot.controller';
import { Bot, BotSchema } from './schemas/Bot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bot.name,
        schema: BotSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [BotRepository],
  exports: [],
})
export class BotModule {}
