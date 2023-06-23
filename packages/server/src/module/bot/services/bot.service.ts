import { Injectable } from '@nestjs/common';
import { BotData } from 'src/shared/interfaces/bot';
import { BotRepository } from '../repository/bot.repository';
import { Bot } from '../schemas/bot.schema';

@Injectable()
export class BotService {
  constructor(private botRepository: BotRepository) {}

  async createBot(name: string): Promise<BotData> {
    const botData: Partial<Bot> = {
      name,
    };
    const createdBot = await this.botRepository.create(botData);
    return createdBot;
  }

  async updateBot(botId: string, name: string): Promise<BotData> {
    const botData: Partial<Bot> = {
      name,
    };
    const updatedBot = await this.botRepository.update(botId, botData);
    return updatedBot;
  }
}
