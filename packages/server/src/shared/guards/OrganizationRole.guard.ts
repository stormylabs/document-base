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
    const accessLevel = this.reflector?.get<string>(
      'accessLevel',
      context.getHandler(),
    );

    if (!req?.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userMember = await this.memberService.findMemberByUserId(
      req?.user?._id,
    );

    req.user.member = userMember;

    // * check access level
    return userMember?.accessLevel === accessLevel;
  }
}
