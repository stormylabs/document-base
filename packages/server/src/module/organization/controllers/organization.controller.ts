import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { errorHandler } from '@/shared/http';

import InviteMemberToOrganizationDTO from '../useCases/InviteMemberToOrganization/dto';
import InviteMemberToOrganizationUseCase from '../useCases/InviteMemberToOrganization';
import { AccessLevel } from '@/shared/interfaces/accessLevel';
import { RoleAccessLevel } from '@/shared/decorators/RoleAccessLevel.decorator';
import { RequestWithUser } from '@/shared/interfaces/requestWithUser';
import { UnauthorizedError } from '@/shared/core/AppError';
import { OrgIdParams } from '@/shared/dto/organization';
import CreateOrganizationDTO, {
  CreateOrganizationResponseDto,
} from '../useCases/CreateOrganization/dto';
import CreateOrganizationUseCase from '../useCases/CreateOrganization';
import { GetOrganizationResponseDto } from '../useCases/GetOrganization/dto';
import GetOrganizationUseCase from '../useCases/GetOrganization';

@ApiSecurity('x-api-key')
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private createOrgUseCase: CreateOrganizationUseCase,
    private getOrgUseCase: GetOrganizationUseCase,
    private inviteUserToOrgUseCase: InviteMemberToOrganizationUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateOrganizationDTO })
  @ApiOperation({
    summary: 'Creates a organization',
  })
  @ApiCreatedResponse({
    description: 'Created organization info',
    type: CreateOrganizationResponseDto,
  })
  @RoleAccessLevel([AccessLevel.ADMIN])
  // ? why this endpoint exists? need to create an org before inviting user to the org
  async createOrganization(@Body() body: CreateOrganizationDTO) {
    const { name } = body;
    this.logger.log(`[POST] Start creating organization`);
    const result = await this.createOrgUseCase.exec(name);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] create organization error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Get(':orgId')
  @ApiOperation({
    summary: 'Get organization info by organization ID.',
  })
  @ApiOkResponse({
    description: 'Get organization info',
    type: GetOrganizationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  @RoleAccessLevel([
    AccessLevel.ADMIN,
    AccessLevel.MEMBER,
    AccessLevel.READ_ONLY,
  ])
  async getOrganization(
    @Param() { orgId }: OrgIdParams,
    @Req() { user }: RequestWithUser,
  ) {
    this.logger.log(`[GET] Start getting organization info`);

    // check org ownership
    if (user?.member?.organization?._id !== orgId) {
      return errorHandler(new UnauthorizedError());
    }

    const result = await this.getOrgUseCase.exec(orgId);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get organization error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  @Post(':orgId/invite')
  @ApiBody({ type: InviteMemberToOrganizationDTO })
  @ApiOperation({
    summary: 'Invite user to organization',
  })
  @ApiCreatedResponse({
    description: 'User added to organization',
  })
  @ApiConflictResponse({
    description: 'Email already exists.',
  })
  @RoleAccessLevel([AccessLevel.ADMIN])
  async inviteUserToOrg(
    @Body() body: InviteMemberToOrganizationDTO,
    @Req() req: RequestWithUser,
    @Param() param: OrgIdParams,
  ) {
    const { email } = body;
    this.logger.log(`[POST] Start invite user to organization`);

    // check org ownership
    if (req?.user?.member?.organization?._id !== param.orgId) {
      return errorHandler(new UnauthorizedError());
    }

    const result = await this.inviteUserToOrgUseCase.exec(param.orgId, email);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] invite user to organization error ${
          error.errorValue().message
        }`,
      );

      return errorHandler(error);
    }

    return result.value.getValue();
  }
}
