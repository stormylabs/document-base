import { Injectable } from '@nestjs/common';
import { BotUsageData } from '@/shared/interfaces/usage';
import { BotUsageRepository } from '../repositories/botUsage.repository';

@Injectable()
export class BotUsageService {
  constructor(private botUsageRepository: BotUsageRepository) {}

  async onBotCreated(data: {
    botId: string;
    userId: string;
  }): Promise<BotUsageData> {
    const createdBotUsage = await this.botUsageRepository.create(data);
    return createdBotUsage;
  }

  async findById(botUsageId: string): Promise<BotUsageData | null> {
    const botUsage = await this.botUsageRepository.findById(botUsageId);
    return botUsage;
  }

  async onBotDeleted(botId: string): Promise<BotUsageData> {
    const botUsage = await this.botUsageRepository.update(botId, {
      deletedAt: new Date(),
    });
    return botUsage;
  }

  async exists(botUsageIds: string[]): Promise<boolean> {
    return this.botUsageRepository.exists(botUsageIds);
  }

  async findUsagesInPeriodByBotIdUserId(
    botId: string,
    userId: string,
    from: Date,
    to: Date,
  ): Promise<BotUsageData[]> {
    const usages = await this.botUsageRepository.findUsagesInPeriod({
      botId,
      userId,
      from,
      to,
    });
    return usages;
  }

  async findUsagesInPeriodByUserId(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<BotUsageData[]> {
    const usages = await this.botUsageRepository.findUsagesInPeriod({
      userId,
      from,
      to,
    });
    return usages;
  }
}
