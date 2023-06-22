import { Injectable } from '@nestjs/common';
import { BotData } from 'src/shared/interfaces/bot';
import { BotRepository } from '../repos/bot.repo';
import { Bot } from '../schemas/bot.schema';

@Injectable()
export class BotService {
  constructor(private readonly botRepository: BotRepository) {}

  async createBot(name: string): Promise<BotData> {
    const botData: Partial<Bot> = {
      name,
    };

    const createdBot = await this.botRepository.create(botData);

    // Convert the Mongoose document to a plain JSON object
    return createdBot.toJSON() as BotData;
  }
}
