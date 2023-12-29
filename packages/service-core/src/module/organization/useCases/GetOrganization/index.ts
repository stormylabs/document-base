import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { GetOrganizationResponseDto } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';
import { Resource } from '@/shared/interfaces';
import { MemberService } from '../../services/member.service';

type Response = Either<
  Result<UseCaseError>,
  Result<GetOrganizationResponseDto>
>;

@Injectable()
export default class GetOrganizationUseCase {
  private readonly logger = new Logger(GetOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly memberService: MemberService
  ) {}
  public async exec(orgId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating organization`);

      const org = await this.orgService.findById(orgId);
      const orgMembers = await this.memberService.getMemberOfOrganization(
        orgId
      );

      if (!org) {
        return left(new NotFoundError(Resource.Organization, [orgId]));
      }

      return right(Result.ok({ ...org, members: orgMembers }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
