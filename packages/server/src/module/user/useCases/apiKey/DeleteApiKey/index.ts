import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  UnauthorizedError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { UserService } from '@/module/user/services/user.service';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<unknown>>;

@Injectable()
export default class DeleteApiKeyUseCase {
  private readonly logger = new Logger(DeleteApiKeyUseCase.name);
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly userService: UserService,
  ) {}
  public async exec(data: {
    userId: string;
    apiKeyId: string;
  }): Promise<Response> {
    try {
      this.logger.log(`Start deleting api key`);

      // check is user exist
      const userExists = await this.userService.exists([data.userId]);
      if (!userExists) return left(new UnauthorizedError());

      // get user api key
      const apiKey = await this.apiKeyService.findOne({
        userId: data.userId,
        apiKeyId: data.apiKeyId,
      });

      // check is the user and apiKey is exist and matches
      if (!apiKey)
        return left(new NotFoundError(Resource.ApiKey, [data.apiKeyId]));

      await this.apiKeyService.delete(data.apiKeyId);

      this.logger.log(`Deleting API Key successfully`);

      return right(Result.ok(null));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
