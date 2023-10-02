import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { GetOrganizationResponseDto } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';
import { Resource } from '@/shared/interfaces';

type Response = Either<
  Result<UseCaseError>,
  Result<GetOrganizationResponseDto>
>;

@Injectable()
export default class GetOrganizationUseCase {
  private readonly logger = new Logger(GetOrganizationUseCase.name);
  constructor(private readonly orgService: OrganizationService) {}
  public async exec(orgId: string): Promise<Response> {
    try {
      this.logger.log(`Start creating organization`);

      const org = await this.orgService.findById(orgId);

      if (!org) {
        return left(new NotFoundError(Resource.Organization, [orgId]));
      }

      return right(Result.ok(org));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
