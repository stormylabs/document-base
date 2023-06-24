import { Injectable } from '@nestjs/common';
import { BotData } from 'src/shared/interfaces/bot';
import { BotRepository } from '../repositories/bot.repository';
import { Bot } from '../schemas/bot.schema';
import UpdateBotDTO from '../useCases/UpdateBot/dto';

@Injectable()
export class BotService {
  constructor(private botRepository: BotRepository) {}

  async create(name: string): Promise<BotData> {
    const botData: Partial<Bot> = {
      name,
    };
    const createdBot = await this.botRepository.create(botData);
    return createdBot;
  }

  async update(botId: string, updateBotData: UpdateBotDTO): Promise<BotData> {
    const botData: Partial<Bot> = {
      ...updateBotData,
    };
    const updatedBot = await this.botRepository.update(botId, botData);
    return updatedBot;
  }

  async exists(botId: string): Promise<boolean> {
    const bot = await this.botRepository.findById(botId);
    return !!bot;
  }

  async findById(botId: string): Promise<BotData | null> {
    const bot = await this.botRepository.findById(botId);
    return bot;
  }
}
