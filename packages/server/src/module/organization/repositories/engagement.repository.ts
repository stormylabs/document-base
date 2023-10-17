import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Engagement } from '../schemas/engagement.schema';
import { EngagementData } from '@/shared/interfaces/engagement';

@Injectable()
export class EngagementRepository {
  constructor(
    @InjectModel(Engagement.name)
    private readonly engagementModel: Model<Engagement>,
  ) {}

  async create(
    engagementData: Partial<Omit<EngagementData, '_id'>>,
  ): Promise<EngagementData> {
    const engagement = new this.engagementModel({
      name: engagementData.name,
      organizationId: engagementData.organizationId,
      budgetPerInteraction: engagementData.budgetPerInteraction,
      executesAt: engagementData.executesAt,
      endsAt: engagementData.endsAt,
      templateId: engagementData.templateId,
      contactsIds: engagementData.contactIds,
      channels: engagementData.channels,
      knowledgeIds: engagementData.knowledgeIds,
      agentId: engagementData.agentId,
      outcome: engagementData.outcome,
      createdAt: engagementData.createdAt,
      deletedAt: engagementData.deletedAt,
      updatedAt: engagementData.updatedAt,
    });
    const saved = await engagement.save();
    return saved.toJSON() as EngagementData;
  }

  async findEngagementByOrgId(orgId: string): Promise<EngagementData[]> {
    const engagements = await this.engagementModel
      .find({ organizationId: new Types.ObjectId(orgId) })
      .exec();
    return engagements.map(
      (engagement) => engagement.toJSON() as EngagementData,
    ) as EngagementData[];
  }

  async findById(engagementId: string): Promise<EngagementData | null> {
    const engagement = await this.engagementModel.findById(engagementId).exec();
    if (!engagement || engagement.deletedAt) return null;
    return engagement.toJSON() as EngagementData;
  }

  async findAll(): Promise<EngagementData[]> {
    const members = await this.engagementModel.find().exec();
    return members.map((engagement) => engagement.toJSON() as EngagementData);
  }

  async exists(memberIds: string[]): Promise<boolean> {
    const count = await this.engagementModel
      .countDocuments({ _id: { $in: memberIds }, deletedAt: null })
      .exec();
    return count === memberIds.length;
  }

  async update(
    memberId: string,
    data: Partial<Omit<EngagementData, 'createdAt' | '_id'>>,
  ): Promise<EngagementData | null> {
    const id = new Types.ObjectId(memberId);
    const engagement = await this.engagementModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return engagement.toJSON() as EngagementData;
  }

  async delete(memberId: string): Promise<EngagementData> {
    const id = new Types.ObjectId(memberId);
    const engagement = await this.engagementModel.findByIdAndDelete(id).exec();
    return engagement.toJSON() as EngagementData;
  }
}
