import { Injectable } from '@nestjs/common';
import { BotRepository } from '../repos/Bot.repo';
import { Bot } from '../schemas/Bot.schema';

@Injectable()
export class BotService {
  constructor(private readonly botRepository: BotRepository) {}

  async createBot(name: string): Promise<Bot> {
    const botData: Partial<Bot> = {
      name,
    };

    return this.botRepository.create(botData);
  }
}
