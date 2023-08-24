import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  UserAlreadyExistsError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { UserService } from '@/module/user/services/user.service';
import { CreateUserResponseDTO } from './dto';

type Response = Either<
  UnexpectedError | UserAlreadyExistsError,
  Result<CreateUserResponseDTO>
>;

@Injectable()
export default class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);
  constructor(private readonly userService: UserService) {}
  public async exec(email: string): Promise<Response> {
    try {
      this.logger.log(`Start creating user`);

      const emailExists = await this.userService.emailExists([email]);
      if (emailExists) return left(new UserAlreadyExistsError());

      const user = await this.userService.create({
        email,
      });

      return right(Result.ok({ user }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
