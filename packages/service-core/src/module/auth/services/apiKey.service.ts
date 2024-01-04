import { Injectable } from '@nestjs/common';
import { ApiKeyData } from '@/shared/interfaces/apiKey';
import { ApiKeyRepository } from '@/module/auth/repositories/apiKey.repository';
import { generateAPIKey } from '@/shared/utils/apiKey';

@Injectable()
export class ApiKeyService {
  constructor(private apiKeyRepository: ApiKeyRepository) {}

  async create(userId: string): Promise<ApiKeyData> {
    const apiKey = await this.generateUniqueApiKey();
    const created = await this.apiKeyRepository.create({
      userId,
      apiKey,
    });
    return created;
  }

  async findOneByUserIdApiKeyId(
    userId: string,
    apiKeyId: string,
  ): Promise<ApiKeyData | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      userId,
      apiKeyId,
    });
    return apiKey;
  }

  async findByUserId(userId: string): Promise<ApiKeyData[]> {
    const apiKeys = await this.apiKeyRepository.find({
      userId,
    });
    return apiKeys;
  }

  async delete(apiKeyId: string): Promise<ApiKeyData> {
    const exists = await this.exists([apiKeyId]);
    if (!exists) throw new Error('Api Key does not exist.');
    const updatedUser = await this.apiKeyRepository.update(apiKeyId, {
      deletedAt: new Date(),
    });
    return updatedUser;
  }

  async findUserByApiKey(key: string): Promise<ApiKeyData | null> {
    const apiKeyData = await this.apiKeyRepository.findOne({ key });
    return apiKeyData;
  }

  async isKeyValid(apiKey: string): Promise<boolean> {
    return this.apiKeyRepository.apiKeyExists([apiKey]);
  }

  async exists(apiKeyIds: string[]): Promise<boolean> {
    return this.apiKeyRepository.exists(apiKeyIds);
  }

  private async generateUniqueApiKey(): Promise<string> {
    const apiKey = generateAPIKey();
    // check to make sure that there is no duplication of apiKey
    const apiKeysExists = await this.isKeyValid(apiKey);
    if (apiKeysExists) {
      return this.generateUniqueApiKey();
    }
    return apiKey;
  }
}
