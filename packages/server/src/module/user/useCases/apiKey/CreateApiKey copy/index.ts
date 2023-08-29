import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { UnauthorizedError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import { CreateApiKeyResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { generateKey, generateSecretHash } from '@/shared/utils/apiKey';
import { UserService } from '@/module/user/services/user.service';

type Response = Either<Result<UseCaseError>, Result<CreateApiKeyResponseDTO>>;

@Injectable()
export default class CreateApiKeyUseCase {
  private readonly logger = new Logger(CreateApiKeyUseCase.name);
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly userService: UserService,
  ) {}
  public async exec(data: { userId: string }): Promise<Response> {
    try {
      this.logger.log(`Start creating api key`);

      // check is user exist
      const userExists = await this.userService.exists([data.userId]);
      if (!userExists) return left(new UnauthorizedError());

      // generate uniq api key
      const uniqApiKey = await this.generateUniqApiKey();

      const { user: userId, ...restApiKey } = await this.apiKeyService.create({
        apiKey: uniqApiKey.secretKey,
        userId: data.userId,
      });

      delete restApiKey.apiKey; // exclude the apiKey as response

      this.logger.log(`Create API Key successfully`);

      return right(
        Result.ok({
          ...restApiKey,
          apiKeyId: uniqApiKey.keyId,
          userId,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async generateUniqApiKey() {
    const keyId = generateKey(32, 'base64');
    const secretKeyHash = generateSecretHash(keyId);
    // check to make sure that there is no duplication of apiKey
    const apiKeysExists = await this.apiKeyService.apiKeyExists([
      secretKeyHash,
    ]);

    if (apiKeysExists) {
      this.generateUniqApiKey();
    } else {
      return {
        keyId,
        secretKey: secretKeyHash,
      };
    }
  }
}
