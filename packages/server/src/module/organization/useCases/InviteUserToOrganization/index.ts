import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  ConflictError,
  NotFoundError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { UserService } from '@/module/user/services/user.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';
import { Resource } from '@/shared/interfaces';

type Response = Either<Result<UseCaseError>, Result<null>>;

@Injectable()
export default class InviteUserToOrganizationUseCase {
  private readonly logger = new Logger(InviteUserToOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly userService: UserService,
  ) {}
  public async exec(orgId: string, email: string): Promise<Response> {
    try {
      this.logger.log(`Start add user to organization user`);

      // check email
      const emailExists = await this.userService.emailExists([email]);
      if (!emailExists) return left(new NotFoundError(Resource.User, [email]));

      // check orgId
      const orgExists = await this.orgService.exists([orgId]);
      if (!orgExists)
        return left(new NotFoundError(Resource.Organization, [orgId]));

      // get user by email
      const user = await this.userService.findUserByEmail(email);

      // check whether the user is already a member
      const org = await this.orgService.findOrgByUserId(user._id);
      if (org && Object.keys(org).length) {
        if (org._id === orgId) return right(Result.ok());

        return left(
          new ConflictError(
            'User already associated with another organization!',
          ),
        );
      }

      this.logger.log(`Add user to organization`);
      await this.orgService.upsertMembers(orgId, [user._id]);

      return right(Result.ok());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
