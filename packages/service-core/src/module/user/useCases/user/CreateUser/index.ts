import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { UserExistsError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { UserService } from '@/module/user/services/user.service';
import { CreateUserResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';

type Response = Either<Result<UseCaseError>, Result<CreateUserResponseDTO>>;

@Injectable()
export default class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);
  constructor(private readonly userService: UserService) {}
  public async exec(email: string): Promise<Response> {
    try {
      this.logger.log(`Start creating user`);

      const emailExists = await this.userService.emailExists([email]);
      if (emailExists) return left(new UserExistsError());

      const user = await this.userService.create({
        email,
      });

      return right(Result.ok({ user }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
