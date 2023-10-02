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
import { MemberService } from '../../services/member.service';
import { InviteOrganizationResponseDto } from './dto';

type Response = Either<
  Result<UseCaseError>,
  Result<InviteOrganizationResponseDto>
>;

@Injectable()
export default class InviteMemberToOrganizationUseCase {
  private readonly logger = new Logger(InviteMemberToOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {}
  public async exec(orgId: string, email: string): Promise<Response> {
    try {
      this.logger.log(`Start add user to organization user`);

      // get user by email and check
      const user = await this.userService.findUserByEmail(email);
      if (!user) return left(new NotFoundError(Resource.User, [email]));

      // check orgId
      const orgExists = await this.orgService.exists([orgId]);
      if (!orgExists)
        return left(new NotFoundError(Resource.Organization, [orgId]));

      // check whether the user is already a member
      const orgMember = await this.memberService.findMemberByUserId(user._id);
      if (
        orgMember &&
        Object.keys(orgMember).length &&
        orgMember?.organization?._id === orgId
      ) {
        return right(Result.ok());
      }

      this.logger.log(`Add user to organization member`);
      await this.memberService.create({
        userId: user._id,
        organizationId: orgId,
      });

      return right(Result.ok(null));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
