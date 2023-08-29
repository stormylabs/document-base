import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { UnauthorizedError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { ApiKeyService } from '@/module/user/services/apiKey.service';
import { RevealAPIKeyResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { compareKeys } from '@/shared/utils/apiKey';
import { UserService } from '@/module/user/services/user.service';

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

      // get last user api keys
      const { user: userId, ...apiKey } = await this.apiKeyService.findByUserId(
        data.userId,
      );

      const isMatch = compareKeys(apiKey.apiKey, data.apiKeyId);

      if (!isMatch) return left(new UnauthorizedError());

      this.logger.log(`Reveal API Key successfully`);

      return right(
        Result.ok({
          ...apiKey,
          userId,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
