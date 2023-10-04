import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { AddEngagementOrganizationResponseDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';
import { MemberService } from '../../services/member.service';

type Response = Either<
  Result<UseCaseError>,
  Result<AddEngagementOrganizationResponseDTO>
>;

@Injectable()
export default class AddEngagementOrganizationUseCase {
  private readonly logger = new Logger(AddEngagementOrganizationUseCase.name);
  constructor(
    private readonly orgService: OrganizationService,
    private readonly memberService: MemberService,
  ) {}
  public async exec(
    name,
    budgetPerIntraction,
    endsAT,
    templateId,
    contactIds,
    channels,
    knowledgeIds,
    outcome,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating organization`);

      // return right();
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
