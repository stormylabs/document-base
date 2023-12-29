import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const clientApiKey = req.headers['x-api-key'] ?? req.query.api_key; // checks the header, moves to query if null

    const serverApiKey = this.configService.get('INTERNAL_API_KEY');

    if (clientApiKey !== serverApiKey) throw new UnauthorizedException();

    return true;
  }
}
