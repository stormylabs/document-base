import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import { GetApiKeyIDsResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { UserService } from '@/module/user/services/user.service';
import { Resource } from '@/shared/interfaces';

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

      // check is user exist
      const userExists = await this.userService.exists([data.userId]);
      if (!userExists)
        return left(new NotFoundError(Resource.User, [data.userId]));

      const apiKeys = await this.apiKeyService.find({
        userId: data.userId,
      });

      this.logger.log(`Get API Keys successfully`);
      return right(
        Result.ok({
          apiKeys: apiKeys.map(({ _id, createdAt }) => ({
            _id,
            createdAt,
          })),
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
