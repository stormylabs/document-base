import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  UnauthorizedError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import { RevealAPIKeyResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { UserService } from '@/module/user/services/user.service';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<RevealAPIKeyResponseDTO>>;

@Injectable()
export default class RevealAPIKeyUseCase {
  private readonly logger = new Logger(RevealAPIKeyUseCase.name);
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly userService: UserService,
  ) {}
  public async exec(data: {
    userId: string;
    apiKeyId: string;
  }): Promise<Response> {
    try {
      this.logger.log(`Start reveal api key`);

      // check is user exist
      const userExists = await this.userService.exists([data.userId]);
      if (!userExists) return left(new UnauthorizedError());

      // get user api keys
      const apiKey = await this.apiKeyService.findOne({
        userId: data.userId,
        apiKeyId: data.apiKeyId,
      });
      const { user: userId, ...restApiKey } = apiKey;

      if (!apiKey)
        return left(new NotFoundError(Resource.ApiKey, [data.apiKeyId]));

      this.logger.log(`Reveal API Key successfully`);

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
}
