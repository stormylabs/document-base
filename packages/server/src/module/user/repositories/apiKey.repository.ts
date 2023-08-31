import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { ApiKeyData } from '@/shared/interfaces/apiKey';
import { ApiKey } from '@/module/user/schemas/apiKey.schema';

@Injectable()
export class ApiKeyRepository {
  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>,
  ) {}

  async create(apiKeyData: {
    userId: string;
    apiKey: string;
  }): Promise<ApiKeyData> {
    const userId = new Types.ObjectId(apiKeyData.userId);

    const apiKey = new this.apiKeyModel({ ...apiKeyData, user: userId });
    const saved = await apiKey.save();
    return saved.toJSON() as ApiKeyData;
  }

  async findById(apiKeyId: string): Promise<ApiKeyData | null> {
    const id = new Types.ObjectId(apiKeyId);
    const apiKey = await this.apiKeyModel.findById(id).exec();
    if (!apiKey || apiKey.deletedAt) return null;
    return apiKey.toJSON() as ApiKeyData;
  }

  async findOne(data: {
    userId?: string;
    apiKeyId?: string;
  }): Promise<ApiKeyData | null> {
    const queries = {} as {
      user?: Types.ObjectId;
      _id?: Types.ObjectId;
    };

    if (data?.userId) {
      queries.user = new Types.ObjectId(data.userId);
    }

    if (data?.apiKeyId) {
      queries._id = new Types.ObjectId(data.apiKeyId);
    }

    const apiKey = await this.apiKeyModel
      .findOne({
        ...queries,
        deletedAt: null,
      })
      .sort({ createdAt: -1 }) // get latest api key
      .exec();

    if (!apiKey || apiKey.deletedAt) return null;

    return apiKey.toJSON() as ApiKeyData;
  }

  async find(data?: { userId?: string }): Promise<ApiKeyData[]> {
    const queries = {} as {
      user?: Types.ObjectId;
    };

    if (data?.userId) {
      queries.user = new Types.ObjectId(data.userId);
    }

    const apiKeys = await this.apiKeyModel.find(queries).exec();
    return apiKeys.map((user) => user.toJSON() as ApiKeyData);
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
