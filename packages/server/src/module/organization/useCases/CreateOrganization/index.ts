import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { CreateOrganizationResponseDto } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';
import { MemberService } from '../../services/member.service';

type Response = Either<
  Result<UseCaseError>,
  Result<CreateOrganizationResponseDto>
>;

@Injectable()
export default class CreateOrganizationUseCase {
  private readonly logger = new Logger(CreateOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly memberService: MemberService,
  ) {}
  public async exec(name: string, userId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating organization`);

      const org = await this.orgService.create({
        name,
      });

      // create member (by default org creator is assigned as admin role)
      await this.memberService.create({
        userId,
        organizationId: org?._id,
      });

      return right(Result.ok(org));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
