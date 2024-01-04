import { BotService } from '@/module/bot/services/bot.service';
import { UserData } from '@/shared/interfaces/user';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotOwnershipGuard implements CanActivate {
  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserData; // Assuming the authenticated user is stored in req.user
    if (!user) throw new UnauthorizedException();
    const botId = request.params.id; // Assuming the owner ID is passed in the request parameter
    if (user.email === this.configService.get('ROOT_EMAIL')) return true;

    const bot = await this.botService.findOneByUserIdBotId(botId, user._id); // Assuming the user ID is stored in req.user.id

    // user accessing resource that does not belong to them
    if (!bot) throw new UnauthorizedException();
    return true;
  }
}
