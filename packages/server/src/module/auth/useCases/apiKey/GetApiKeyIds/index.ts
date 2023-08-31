import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { UnauthorizedError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/auth/services/apiKey.service';
import { GetApiKeyIDsResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { UserService } from '@/module/user/services/user.service';

type Response = Either<Result<UseCaseError>, Result<GetApiKeyIDsResponseDTO>>;

@Injectable()
export default class GetApiKeyIdsUseCase {
  private readonly logger = new Logger(GetApiKeyIdsUseCase.name);
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly userService: UserService,
  ) {}
  public async exec(data: { userId: string }): Promise<Response> {
    try {
      this.logger.log(`Start getting api keys`);

      // check if user exist
      const userExists = await this.userService.exists([data.userId]);
      if (!userExists) return left(new UnauthorizedError());

      const apiKeys = await this.apiKeyService.findByUserId(data.userId);

      this.logger.log(`Get API Keys successfully`);
      return right(
        Result.ok({
          apiKeys: apiKeys.map(({ _id, createdAt, apiKey, user: userId }) => ({
            userId,
            apiKey,
            createdAt,
            _id,
          })),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
