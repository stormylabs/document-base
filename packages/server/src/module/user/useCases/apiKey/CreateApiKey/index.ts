import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import { CreateApiKeyResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { generateKey } from '@/shared/utils/apiKey';

type Response = Either<Result<UseCaseError>, Result<CreateApiKeyResponseDTO>>;

@Injectable()
export default class CreateApiKeyUseCase {
  private readonly logger = new Logger(CreateApiKeyUseCase.name);
  constructor(private readonly apiKeyService: ApiKeyService) {}
  public async exec(data: { userId: string }): Promise<Response> {
    try {
      this.logger.log(`Start creating api key`);

      // generate uniq api key
      const uniqApiKey = await this.generateUniqApiKey();

      const { user: userId, ...restApiKey } = await this.apiKeyService.create({
        apiKey: uniqApiKey,
        userId: data.userId,
      });

      this.logger.log(`Create API Key successfully`);

      return right(
        Result.ok({
          ...restApiKey,
          userId,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async generateUniqApiKey() {
    const apiKey = generateKey(32, 'base64');
    const apiKeysExists = await this.apiKeyService.apiKeyExists([apiKey]);

    if (apiKeysExists) {
      this.generateUniqApiKey();
    } else {
      return apiKey;
    }
  }
}
