import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { GetUserInfoResponseDTO } from './dto';
import { UserService } from '@/module/user/services/user.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<GetUserInfoResponseDTO>>;

@Injectable()
export default class GetUserInfoUseCase {
  private readonly logger = new Logger(GetUserInfoUseCase.name);
  constructor(private readonly userService: UserService) {}
  public async exec(userId: string): Promise<Response> {
    try {
      this.logger.log(`Start getting user info`);

      const user = await this.userService.findById(userId);
      if (!user) return left(new NotFoundError(Resource.User, [userId]));

      this.logger.log(`Get user info successfully`);
      return right(
        Result.ok({
          user,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
