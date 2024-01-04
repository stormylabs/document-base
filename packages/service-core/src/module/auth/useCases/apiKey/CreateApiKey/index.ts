import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { UnauthorizedError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/auth/services/apiKey.service';
import { CreateApiKeyResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { UserService } from '@/module/user/services/user.service';

type Response = Either<Result<UseCaseError>, Result<CreateApiKeyResponseDTO>>;

@Injectable()
export default class CreateApiKeyUseCase {
  private readonly logger = new Logger(CreateApiKeyUseCase.name);
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly userService: UserService,
  ) {}
  public async exec(userId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating API Key`);

      // check is user exist
      const userExists = await this.userService.exists([userId]);
      if (!userExists) return left(new UnauthorizedError());

      const apiKeyData = await this.apiKeyService.create(userId);
      this.logger.log(`API Key created successfully`);

      return right(
        Result.ok({
          userId,
          apiKey: apiKeyData.apiKey,
          createdAt: apiKeyData.createdAt,
          _id: apiKeyData._id,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
