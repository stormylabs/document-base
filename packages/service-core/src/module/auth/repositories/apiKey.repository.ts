import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKeyData } from '@/shared/interfaces/apiKey';
import { ApiKey } from '@/module/auth/schemas/apiKey.schema';

@Injectable()
export class ApiKeyRepository {
  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>
  ) {}

  async create(apiKeyData: {
    userId: string;
    apiKey: string;
  }): Promise<ApiKeyData> {
    const userId = new Types.ObjectId(apiKeyData.userId);
    const apiKey = new this.apiKeyModel({
      ...apiKeyData,
      user: userId,
    });
    const saved = await apiKey.save();
    return saved.toJSON() as ApiKeyData;
  }

  async findById(apiKeyId: string): Promise<ApiKeyData | null> {
    const id = new Types.ObjectId(apiKeyId);
    const apiKey = await this.apiKeyModel.findById(id).populate('user').exec();
    if (!apiKey || apiKey.deletedAt) return null;
    return apiKey.toJSON() as ApiKeyData;
  }

  async findOne(data: {
    userId?: string;
    apiKeyId?: string;
    key?: string;
  }): Promise<ApiKeyData | null> {
    const query = {};
    if (data.userId) query['user'] = new Types.ObjectId(data.userId);
    if (data.apiKeyId) query['_id'] = new Types.ObjectId(data.apiKeyId);
    if (data.key) query['apiKey'] = data.key;
    const apiKey = await this.apiKeyModel
      .findOne({
        ...query,
        deletedAt: null,
      })
      .populate('user')
      .exec();

    if (!apiKey || apiKey.deletedAt) return null;
    return apiKey.toJSON() as ApiKeyData;
  }

  async find(data: { userId: string }): Promise<ApiKeyData[]> {
    const user = new Types.ObjectId(data.userId);
    const apiKeys = await this.apiKeyModel
      .find({ user, deletedAt: null })
      .populate('user')
      .exec();
    return apiKeys.map((apiKey) => apiKey.toJSON() as ApiKeyData);
  }

  async apiKeyExists(apiKeys: string[]): Promise<boolean> {
    const count = await this.apiKeyModel
      .countDocuments({ apiKey: { $in: apiKeys }, deletedAt: null })
      .exec();
    return count === apiKeys.length;
  }

  async exists(apiKeyIds: string[]): Promise<boolean> {
    const count = await this.apiKeyModel
      .countDocuments({ _id: { $in: apiKeyIds }, deletedAt: null })
      .exec();
    return count === apiKeyIds.length;
  }

  async update(
    apiKeyId: string,
    data: Partial<Omit<ApiKeyData, 'createdAt' | '_id'>>
  ): Promise<ApiKeyData | null> {
    const id = new Types.ObjectId(apiKeyId);
    const apiKey = await this.apiKeyModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return apiKey.toJSON() as ApiKeyData;
  }

  async delete(apiKeyId: string): Promise<ApiKeyData> {
    const id = new Types.ObjectId(apiKeyId);
    const apiKey = await this.apiKeyModel.findByIdAndDelete(id).exec();
    return apiKey.toJSON() as ApiKeyData;
  }
}
