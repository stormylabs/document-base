import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
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
  ApiUnauthorizedResponse,
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
import { ApiKeyGuard } from '@/shared/guards/ApiKey.guard';
import { OrganizationRoleGuard } from '@/shared/guards/OrganizationRole.guard';
import {
  CrawlWebsitesByOrganizationDTO,
  CrawlWebsitesByOrganizationResponseDTO,
} from '../useCases/CrawlWebsitesByOrganizationUseCase/dto';
import CrawlWebsitesByOrganizationUseCase from '../useCases/CrawlWebsitesByOrganizationUseCase';

@ApiSecurity('x-api-key')
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private createOrgUseCase: CreateOrganizationUseCase,
    private getOrgUseCase: GetOrganizationUseCase,
    private inviteUserToOrgUseCase: InviteMemberToOrganizationUseCase,
    private crawlWebsiteByOrgUseCase: CrawlWebsitesByOrganizationUseCase,
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
  @UseGuards(ApiKeyGuard)
  async createOrganization(
    @Body() body: CreateOrganizationDTO,
    @Req() req: RequestWithUser,
  ) {
    const { name } = body;
    this.logger.log(`[POST] Start creating organization`);
    const result = await this.createOrgUseCase.exec(name, req?.user?._id);

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
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
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
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
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

  @Post(':orgId/crawl')
  @ApiBody({ type: CrawlWebsitesByOrganizationDTO })
  @ApiOperation({
    summary: 'Crawl Website by Organization',
  })
  @ApiCreatedResponse({
    description: 'Crawl Job Id and Status',
    type: CrawlWebsitesByOrganizationResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  @ApiConflictResponse({
    description:
      'If there are unfinished web crawl jobs or train jobs, this error will be returned.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @RoleAccessLevel([AccessLevel.ADMIN, AccessLevel.MEMBER])
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
  async crawlWebsite(
    @Body() body: CrawlWebsitesByOrganizationDTO,
    @Req() req: RequestWithUser,
    @Param() param: OrgIdParams,
  ) {
    const { only, urls } = body;
    this.logger.log(`[POST] Start crawl websites by organization`);

    // check org ownership
    if (req?.user?.member?.organization?._id !== param.orgId) {
      return errorHandler(new UnauthorizedError());
    }

    const result = await this.crawlWebsiteByOrgUseCase.exec(
      param.orgId,
      urls,
      only,
    );

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
