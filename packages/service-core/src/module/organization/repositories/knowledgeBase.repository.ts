import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeBaseData } from '@/shared/interfaces/knowledgeBase';
import { KnowledgeBase } from '../schemas/knowledgeBase.schema';

@Injectable()
export class KnowledgeBaseRepository {
  constructor(
    @InjectModel(KnowledgeBase.name)
    private readonly knowledgeBaseModel: Model<KnowledgeBase>,
  ) {}

  async create(
    knowledgeBaseData: Partial<Omit<KnowledgeBaseData, 'organization'>> & {
      organizationId: string;
    },
  ): Promise<KnowledgeBaseData> {
    const knowledgeBase = new this.knowledgeBaseModel({
      organization: new Types.ObjectId(knowledgeBaseData.organizationId),
      type: knowledgeBaseData.type,
      name: knowledgeBaseData.name,
    });
    const saved = await knowledgeBase.save();
    return saved.toJSON() as KnowledgeBaseData;
  }

  async findById(knowledgeBaseId: string): Promise<KnowledgeBaseData | null> {
    const id = new Types.ObjectId(knowledgeBaseId);
    const knowledgeBase = await this.knowledgeBaseModel
      .findById(id)
      .populate('organization')
      .exec();
    if (!knowledgeBase || knowledgeBase.deletedAt) return null;
    return knowledgeBase.toJSON() as KnowledgeBaseData;
  }

  async findAll(): Promise<KnowledgeBaseData[]> {
    const knowledgeBases = await this.knowledgeBaseModel.find().exec();
    return knowledgeBases.map(
      (knowledgeBase) => knowledgeBase.toJSON() as KnowledgeBaseData,
    );
  }

  async findByOrgId(orgId: string): Promise<KnowledgeBaseData[]> {
    const organization = new Types.ObjectId(orgId);
    const knowledgeBases = await this.knowledgeBaseModel
      .find({
        organization,
      })
      .exec();

    if (!knowledgeBases) return null;
    return knowledgeBases.map(
      (knowledgeBase) => knowledgeBase.toJSON() as KnowledgeBaseData,
    );
  }

  async exists(knowledgeBaseIds: string[]): Promise<boolean> {
    const count = await this.knowledgeBaseModel
      .countDocuments({ _id: { $in: knowledgeBaseIds }, deletedAt: null })
      .exec();
    return count === knowledgeBaseIds.length;
  }

  async update(
    knowledgeBaseId: string,
    data: Partial<Omit<KnowledgeBaseData, 'createdAt' | '_id'>>,
  ): Promise<KnowledgeBaseData | null> {
    const id = new Types.ObjectId(knowledgeBaseId);
    const knowledgeBase = await this.knowledgeBaseModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return knowledgeBase.toJSON() as KnowledgeBaseData;
  }

  async upsertDocuments(
    knowledgeBaseId: string,
    documentIds: string[],
  ): Promise<KnowledgeBaseData> {
    const id = new Types.ObjectId(knowledgeBaseId);
    const knowledgeBase = await this.knowledgeBaseModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { documents: { $each: documentIds } } },
        { new: true },
      )
      .populate('documents')
      .exec();
    return knowledgeBase.toJSON() as KnowledgeBaseData;
  }

  async delete(knowledgeBaseId: string): Promise<KnowledgeBaseData> {
    const id = new Types.ObjectId(knowledgeBaseId);
    const knowledgeBase = await this.knowledgeBaseModel
      .findByIdAndDelete(id)
      .exec();
    return knowledgeBase.toJSON() as KnowledgeBaseData;
  }
}
