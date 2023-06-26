import { Injectable } from '@nestjs/common';
import { BotData } from 'src/shared/interfaces/bot';
import { BotRepository } from '../repositories/bot.repository';

@Injectable()
export class BotService {
  constructor(private botRepository: BotRepository) {}

  async create(name: string): Promise<BotData> {
    const botData: Partial<BotData> = {
      name,
    };
    const createdBot = await this.botRepository.create(botData);
    return createdBot;
  }

  async findById(botId: string): Promise<BotData | null> {
    const bot = await this.botRepository.findById(botId);
    return bot;
  }

  async update(
    botId: string,
    data: Partial<Omit<BotData, 'createdAt' | '_id'>>,
  ): Promise<BotData> {
    const exists = await this.exists(botId);
    if (!exists) throw new Error('Bot does not exist.');
    const updatedBot = await this.botRepository.update(botId, data);
    return updatedBot;
  }

  async delete(botId: string): Promise<BotData> {
    const exists = await this.exists(botId);
    if (!exists) throw new Error('Bot does not exist.');
    const updatedBot = await this.botRepository.update(botId, {
      deletedAt: new Date(),
    });
    return updatedBot;
  }

  async exists(botId: string): Promise<boolean> {
    const bot = await this.botRepository.findById(botId);
    return !!bot;
  }

  async upsertDocument(botId: string, documentId: string): Promise<BotData> {
    const exists = await this.exists(botId);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.upsertDocument(botId, documentId);
  }

  async removeAllDocuments(botId: string): Promise<BotData> {
    const exists = await this.exists(botId);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.update(botId, { documents: [] });
  }
}
