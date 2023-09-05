import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResourceUsage } from '../schemas/resourceUsage.schema';
import { BillableResource, ResourceUsageData } from '@/shared/interfaces/usage';

@Injectable()
export class ResourceUsageRepository {
  constructor(
    @InjectModel(ResourceUsage.name)
    private readonly resourceUsageModel: Model<ResourceUsage>,
  ) {}

  async create(data: {
    botId: string;
    userId: string;
    resource: BillableResource;
  }): Promise<ResourceUsageData> {
    const usageData = {
      bot: new Types.ObjectId(data.botId),
      user: new Types.ObjectId(data.userId),
      resource: data.resource,
    };
    const usage = new this.resourceUsageModel(usageData);
    const saved = await usage.save();
    return saved.toJSON() as ResourceUsageData;
  }

  async findById(usageId: string): Promise<ResourceUsageData | null> {
    const id = new Types.ObjectId(usageId);
    const usage = await this.resourceUsageModel.findById(id).exec();
    if (!usage) return null;
    return usage.toJSON() as ResourceUsageData;
  }

  async find(data: {
    userId?: string;
    botId?: string;
    from: Date;
    to: Date;
  }): Promise<ResourceUsageData[]> {
    const query = {
      createdAt: {
        $gte: data.from,
        $lte: data.to,
      },
    };
    if (data.userId) query['user'] = new Types.ObjectId(data.userId);
    if (data.botId) query['bot'] = new Types.ObjectId(data.botId);

    const usages = await this.resourceUsageModel.find(query).exec();
    return usages.map((usage) => usage.toJSON() as ResourceUsageData);
  }

  async exists(usageIds: string[]): Promise<boolean> {
    const count = await this.resourceUsageModel
      .countDocuments({ _id: { $in: usageIds }, deletedAt: null })
      .exec();
    return count === usageIds.length;
  }
}
