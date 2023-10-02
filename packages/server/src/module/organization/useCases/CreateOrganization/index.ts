import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { CreateOrganizationResponseDto } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '../../services/organization.service';

type Response = Either<
  Result<UseCaseError>,
  Result<CreateOrganizationResponseDto>
>;

@Injectable()
export default class CreateOrganizationUseCase {
  private readonly logger = new Logger(CreateOrganizationUseCase.name);
  constructor(private readonly orgService: OrganizationService) {}
  public async exec(name: string): Promise<Response> {
    try {
      this.logger.log(`Start creating organization`);

      const org = await this.orgService.create({
        name,
      });

      return right(Result.ok(org));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
