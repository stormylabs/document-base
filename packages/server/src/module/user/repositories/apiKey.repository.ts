import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKeyData } from 'src/shared/interfaces/apiKey';
import { ApiKey } from '../schemas/apiKey.schema';

@Injectable()
export class ApiKeyRepository {
  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>,
  ) {}

  async create(apiKeyData: Partial<ApiKeyData>): Promise<ApiKeyData> {
    const apiKey = new this.apiKeyModel(apiKeyData);
    const saved = await apiKey.save();
    return saved.toJSON() as ApiKeyData;
  }

  async findById(apiKeyId: string): Promise<ApiKeyData | null> {
    const id = new Types.ObjectId(apiKeyId);
    const apiKey = await this.apiKeyModel.findById(id).exec();
    if (!apiKey || apiKey.deletedAt) return null;
    return apiKey.toJSON() as ApiKeyData;
  }

  async findAll(): Promise<ApiKeyData[]> {
    const apiKeys = await this.apiKeyModel.find().exec();
    return apiKeys.map((apiKey) => apiKey.toJSON() as ApiKeyData);
  }

  async exists(apiKeyIds: string[]): Promise<boolean> {
    const count = await this.apiKeyModel
      .countDocuments({ _id: { $in: apiKeyIds }, deletedAt: null })
      .exec();
    return count === apiKeyIds.length;
  }

  async update(
    apiKeyId: string,
    data: Partial<Omit<ApiKeyData, 'createdAt' | '_id'>>,
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
