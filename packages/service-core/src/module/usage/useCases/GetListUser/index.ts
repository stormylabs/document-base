import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import UseCaseError from '@/shared/core/UseCaseError';
import { GetListUsersResponseDTO } from './dto';
import { UserService } from '@/module/user/services/user.service';

type Response = Either<Result<UseCaseError>, Result<GetListUsersResponseDTO>>;

@Injectable()
export default class GetListUserUseCase {
  private readonly logger = new Logger(GetListUserUseCase.name);
  constructor(private readonly userService: UserService) {}
  public async exec(): Promise<Response> {
    try {
      this.logger.log(`Start getting user list`);

      const users = await this.userService.findAll();

      this.logger.log(`Got users list successfully`);

      return right(
        Result.ok({
          users,
        })
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
