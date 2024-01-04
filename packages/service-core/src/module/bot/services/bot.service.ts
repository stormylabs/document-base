import { Injectable } from '@nestjs/common';
import { BotData } from 'src/shared/interfaces/bot';
import { BotRepository } from '../repositories/bot.repository';

@Injectable()
export class BotService {
  constructor(private botRepository: BotRepository) {}

  async create(name: string, userId: string): Promise<BotData> {
    const botData = {
      name,
      userId,
    };
    const createdBot = await this.botRepository.create(botData);
    return createdBot;
  }

  async findOneByUserIdBotId(botId: string, userId: string): Promise<BotData> {
    const bot = await this.botRepository.findOne({ userId, botId });
    return bot;
  }

  async findById(botId: string): Promise<BotData | null> {
    const bot = await this.botRepository.findById(botId);
    return bot;
  }

  async updateInfo(
    botId: string,
    {
      name,
      fallbackMessage,
      prompt,
    }: { name: string; fallbackMessage?: string; prompt?: string },
  ): Promise<BotData> {
    const exists = await this.exists([botId]);
    if (!exists) throw new Error('Bot does not exist.');
    const updatedBot = await this.botRepository.update(botId, {
      name,
      fallbackMessage,
      prompt,
    });
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

  async findByBotIds(botIds: string[]): Promise<BotData[]> {
    const bots = await this.botRepository.findByBotIds(botIds);
    return bots;
  }

  async patch() {
    const totalBots = await this.botRepository.count();
    let processed = 0;
    let bots = await this.botRepository.findBatch();
    while (bots.length > 0) {
      for (const bot of bots) {
        await this.botRepository.update(bot._id, {
          totalTokens: bot.documents.reduce(
            (acc, doc) => acc + (doc.tokens || 0),
            0,
          ),
          totalCharacters: bot.documents.reduce(
            (acc, doc) => acc + (doc.characters || 0),
            0,
          ),
        });
        bots = await this.botRepository.findBatch();
        console.log(
          `Processed ${((processed / totalBots) * 100).toFixed(2)}% bots.`,
        );
        processed++;
      }
    }
  }
}
