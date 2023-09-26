import { ApiKeyService } from '@/module/auth/services/apiKey.service';
import { OrganizationService } from '@/module/organization/services/organization.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly orgService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] ?? req.query.api_key;

    if (!key) throw new UnauthorizedException();

    const apiKey = await this.apiKeyService.findUserByApiKey(key);
    const org = await this.orgService.findOrgByUserId(apiKey?.user?._id);

    // check org ownership
    if (org && org._id !== req?.body?.organizationId) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
