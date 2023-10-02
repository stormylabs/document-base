import { MemberService } from '@/module/organization/services/member.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly memberService: MemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessLevels = this.reflector?.get<string>(
      'accessLevels',
      context.getHandler(),
    );

    if (!req?.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userMember = await this.memberService.findMemberByUserId(
      req?.user?._id,
    );

    // TODO: support user to have more than one org member
    // maybe we can put the orgId(selected/active OrgId) to the http header for each request
    req.user.member = userMember;

    // * check access level
    return accessLevels.includes(userMember?.accessLevel);
  }
}
