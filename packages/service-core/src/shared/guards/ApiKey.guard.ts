import { ApiKeyService } from '@/module/auth/services/apiKey.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] ?? req.query.api_key; // checks the header, moves to query if null

    if (!key) throw new UnauthorizedException();
    const isValid = await this.apiKeyService.isKeyValid(key);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const { user } = await this.apiKeyService.findUserByApiKey(key);

    req.user = user;

    return true;
  }
}
