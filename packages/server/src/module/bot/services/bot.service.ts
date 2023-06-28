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

  async updateInfo(
    botId: string,
    { name }: { name: string },
  ): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    const updatedBot = await this.botRepository.update(botId, { name });
    return updatedBot;
  }

  async delete(botId: string): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    const updatedBot = await this.botRepository.update(botId, {
      deletedAt: new Date(),
    });
    return updatedBot;
  }

  async exists(botIds: string[]): Promise<boolean> {
    return this.botRepository.exists(botIds);
  }

  async upsertDocument(botId: string, documentId: string): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.upsertDocuments(botId, [documentId]);
  }

  async upsertDocuments(
    botId: string,
    documentIds: string[],
  ): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.upsertDocuments(botId, documentIds);
  }

  async removeDocuments(
    botId: string,
    documentIds: string[],
  ): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.removeDocuments(botId, documentIds);
  }

  async removeAllDocuments(botId: string): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    return this.botRepository.update(botId, { documents: [] });
  }
}
