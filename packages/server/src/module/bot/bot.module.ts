import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './services/bot.service';
import CreateBotUseCase from './useCases/CreateBot';

@Module({
  imports: [],
  controllers: [BotController],
  providers: [CreateBotUseCase, BotService],
  exports: [],
})
export class BotModule {}
