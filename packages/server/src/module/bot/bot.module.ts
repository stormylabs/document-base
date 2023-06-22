import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotRepository } from './repos/Bot.repo';
import { BotService } from './services/Bot.service';
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
  providers: [BotRepository, BotService],
  exports: [BotService],
})
export class BotModule {}
