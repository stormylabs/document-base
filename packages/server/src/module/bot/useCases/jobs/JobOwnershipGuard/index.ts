import { BotService } from '@/module/bot/services/bot.service';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { UserData } from '@/shared/interfaces/user';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isMongoId } from 'class-validator';

// TODO: update this guard, due to the organization schema relation
@Injectable()
export class JobOwnershipGuard implements CanActivate {
  constructor(
    private readonly botService: BotService,
    private readonly crawlJobService: CrawlJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserData; // Assuming the authenticated user is stored in req.user
    if (!user) throw new UnauthorizedException();

    const resourceId = request.params.id; // Assuming the owner ID is passed in the request parameter

    // make sure user are pass the correct mongoId format
    if (!isMongoId(resourceId))
      throw new BadRequestException('Invalid parameter ID');

    const route = request.route.path;
    const regex = /\/data\/(train|crawl|extract)\//;
    const match = route.match(regex);
    if (!match || !match[1]) throw new BadRequestException();
    const resource = match[1];
    let jobService:
      | CrawlJobService
      | ExtractFileJobService
      | DocIndexJobService;
    if (resource === 'crawl') jobService = this.crawlJobService;
    if (resource === 'extract') jobService = this.extractFileJobService;
    if (resource === 'train') jobService = this.docIndexJobService;

    const job = await jobService.findById(resourceId);
    if (!job) throw new NotFoundException();

    if (user.email === this.configService.get('ROOT_EMAIL')) return true;

    const bot = await this.botService.findOneByUserIdBotId(job.bot, user._id);

    // user accessing resource that does not belong to them
    if (!bot) throw new UnauthorizedException();
    return true;
  }
}
