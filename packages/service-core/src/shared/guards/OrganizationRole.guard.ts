import { MemberService } from '@/module/organization/services/member.service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isMongoId } from 'class-validator';

/**
 * OrganizationRoleGuard
 *
 * Guard to protect org route path (checking orgId param)
 */
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

    // ? maybe we can put the orgId(selected/active OrgId) to the http header for each request and param orgId validation would be inside the controller
    const organizationId = req?.params?.orgId;
    const userId = req?.user?._id;

    if (!isMongoId(organizationId)) {
      throw new BadRequestException('Invalid parameter ID');
    }

    const userMember = await this.memberService.findMemberByUserId({
      userId,
      organizationId,
    });

    if (!userMember) {
      throw new UnauthorizedException('Unauthorized');
    }

    req.user.member = userMember;

    // * check access level
    if (!accessLevels.includes(userMember?.accessLevel)) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
