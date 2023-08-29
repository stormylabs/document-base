import { Injectable } from '@nestjs/common';
import { ApiKeyData } from '@/shared/interfaces/apiKey';
import { ApiKeyRepository } from '@/module/user/repositories/apiKey.repository';

@Injectable()
export class ApiKeyService {
  constructor(private apiKeyRepository: ApiKeyRepository) {}

  async create(apiKeyData: {
    userId: string;
    apiKey: string;
  }): Promise<ApiKeyData> {
    const createdUser = await this.apiKeyRepository.create(apiKeyData);
    return createdUser;
  }

  async findById(apiKeyId: string): Promise<ApiKeyData | null> {
    const apiKey = await this.apiKeyRepository.findById(apiKeyId);
    return apiKey;
  }

  async findByUserId(userId: string): Promise<ApiKeyData | null> {
    const apiKey = await this.apiKeyRepository.finByUserId(userId);
    return apiKey;
  }

  async delete(apiKeyId: string): Promise<ApiKeyData> {
    const exists = await this.exists([apiKeyId]);
    if (!exists) throw new Error('Api Key does not exist.');
    const updatedUser = await this.apiKeyRepository.update(apiKeyId, {
      deletedAt: new Date(),
    });
    return updatedUser;
  }

  async apiKeyExists(apiKeys: string[]): Promise<boolean> {
    return this.apiKeyRepository.apiKeyExists(apiKeys);
  }

  async exists(apiKeyIds: string[]): Promise<boolean> {
    return this.apiKeyRepository.exists(apiKeyIds);
  }
}
