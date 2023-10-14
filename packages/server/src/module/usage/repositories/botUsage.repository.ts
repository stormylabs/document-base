import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BotUsage } from '../schemas/botUsage.schema';
import { BotUsageData } from '@/shared/interfaces/usage';

@Injectable()
export class BotUsageRepository {
  constructor(
    @InjectModel(BotUsage.name)
    private readonly botUsageModel: Model<BotUsage>,
  ) {}

  async create(data: { botId: string; userId: string }): Promise<BotUsageData> {
    const usageData = {
      bot: new Types.ObjectId(data.botId),
      user: new Types.ObjectId(data.userId),
    };
    const usage = new this.botUsageModel(usageData);
    const saved = await usage.save();
    return saved.toJSON() as BotUsageData;
  }

  async update(
    botId: string,
    data: Partial<{ days: number; deletedAt: Date }>,
  ): Promise<BotUsageData | null> {
    const id = new Types.ObjectId(botId);
    const botUsage = await this.botUsageModel.findByIdAndUpdate(
      { botId: id },
      { $set: { ...data } },
      {
        new: true,
      },
    );
    return botUsage.toJSON() as BotUsageData;
  }

  async findById(usageId: string): Promise<BotUsageData | null> {
    const id = new Types.ObjectId(usageId);
    const usage = await this.botUsageModel.findById(id).exec();
    if (!usage) return null;
    return usage.toJSON() as BotUsageData;
  }

  async findUsagesInPeriod(data: {
    botId?: string;
    userId: string;
    from: Date;
    to: Date;
  }) {
    const query = {
      user: new Types.ObjectId(data.userId),
      $or: [
        { deletedAt: null, createdAt: { $lte: data.to } },
        { deletedAt: { $gte: data.from }, createdAt: { $lte: data.to } },
      ],
    };
    if (data.botId) query['bot'] = new Types.ObjectId(data.botId);
    const usages = await this.botUsageModel.find(query).populate('bot').exec();
    return usages.map((usage) => usage.toJSON() as BotUsageData);
  }

  async exists(usageIds: string[]): Promise<boolean> {
    const count = await this.botUsageModel
      .countDocuments({ _id: { $in: usageIds }, deletedAt: null })
      .exec();
    return count === usageIds.length;
  }
}
