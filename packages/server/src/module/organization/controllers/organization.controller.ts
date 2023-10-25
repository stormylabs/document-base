import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
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
import { AddEngagementOrganizationResponseDTO } from '../useCases/AddEngagementToOrganization/dto';
import AddEngagementToOrganizationDTO from '../useCases/AddEngagementToOrganization/dto';
import AddEngagementOrganizationUseCase from '../useCases/AddEngagementToOrganization';
import { EngagementIdParams } from '@/shared/dto/engagement';
import GetEngagementUseCase from '../useCases/GetEngagement';
import AddKnowledgeBaseToOrganizationDTO from '../useCases/AddKnowlagebaseToOrganization/CreateOrganization/dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AddKnowledgeBaseJobResponseDTO } from '@/shared/dto/addKnowledgeBaseJob';
import { CustomFileCountValidationPipe } from '@/shared/validators/file-count.pipe';
import { CustomUploadFileMimeTypeValidator } from '@/shared/validators/file-mimetype.validator';
import AddKnowledgeBaseToOrganizationUseCase from '../useCases/AddKnowlagebaseToOrganization/CreateOrganization';

const ALLOWED_UPLOADS_EXT_TYPES = ['.doc', '.docx', '.pdf'];
const MAX_FILE_COUNT = 10;
const MIN_FILE_COUNT = 1;

@ApiSecurity('x-api-key')
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private createOrgUseCase: CreateOrganizationUseCase,
    private getOrgUseCase: GetOrganizationUseCase,
    private inviteUserToOrgUseCase: InviteMemberToOrganizationUseCase,
    private addEngagementOrganizationUseCase: AddEngagementOrganizationUseCase,
    private getEngagementUseCase: GetEngagementUseCase,
    private addKnowledgeBaseToOrganizationUseCase: AddKnowledgeBaseToOrganizationUseCase,
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
    const { name, descriptions, values } = body;
    this.logger.log(`[POST] Start creating organization`);
    const result = await this.createOrgUseCase.exec(
      name,
      descriptions,
      values,
      req?.user?._id,
    );

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

  // Add engagement to organization Endpoint
  @Post(':orgId/engagement')
  @ApiBody({ type: AddEngagementToOrganizationDTO })
  @ApiOperation({
    summary: 'Add engagement to organization',
  })
  @ApiCreatedResponse({
    description: 'Engagement added to organization',
    type: AddEngagementOrganizationResponseDTO,
  })
  @ApiConflictResponse({
    description: 'Engagement already exists.',
  })
  @RoleAccessLevel([AccessLevel.ADMIN, AccessLevel.MEMBER])
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
  async addEngagementToOrg(
    @Body() body: AddEngagementToOrganizationDTO,
    @Req() req: RequestWithUser,
    @Param() param: OrgIdParams,
  ) {
    const {
      name,
      budgetPerInteraction,
      agentName,
      agentRole,
      purpose,
      executesAt,
      endsAt,
      templateId,
      contactIds,
      channelIds,
      knowledgeBaseIds,
      outcome,
    } = body;
    this.logger.log(`[POST] Start add engagement to organization`);

    // check org ownership
    if (req?.user?.member?.organization?._id !== param.orgId) {
      this.logger.error('[POST] add engagement to organization error');
      return errorHandler(new UnauthorizedError());
    }

    const result = await this.addEngagementOrganizationUseCase.exec(
      name,
      param.orgId,
      budgetPerInteraction,
      agentName,
      agentRole,
      purpose,
      executesAt,
      endsAt,
      templateId,
      contactIds,
      channelIds,
      knowledgeBaseIds,
      outcome,
    );

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[POST] add engagement to organization error ${
          error.errorValue().message
        }`,
      );

      return errorHandler(error);
    }

    return result.value.getValue();
  }

  // Get engagement by engagement ID Endpoint
  @Get(':orgId/engagement/:engagementId')
  @ApiOperation({
    summary: 'Get engagement info by engagement ID.',
  })
  @ApiOkResponse({
    description: 'Get engagement info',
    type: GetOrganizationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Engagement not found',
  })
  @RoleAccessLevel([
    AccessLevel.ADMIN,
    AccessLevel.MEMBER,
    AccessLevel.READ_ONLY,
  ])
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
  async getEngagement(
    @Param() { engagementId, orgId }: EngagementIdParams & OrgIdParams,
    @Req() { user }: RequestWithUser,
  ) {
    this.logger.log(`[GET] Start getting engagement info`);

    // check org ownership
    if (user?.member?.organization?._id !== orgId) {
      return errorHandler(new UnauthorizedError());
    }

    const result = await this.getEngagementUseCase.exec(engagementId);

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error(
        `[GET] get engagement error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }

  /**
   * Add knowledge base to organization
   * @param param
   * @param files
   * @returns
   */
  @Post(':orgId/knowledgeBase/add')
  @UseGuards(ApiKeyGuard, OrganizationRoleGuard)
  @ApiBody({ type: AddKnowledgeBaseToOrganizationDTO })
  @ApiOperation({
    summary: 'Extract files by bot.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOkResponse({
    description: 'Add knowledge base to organization',
    type: AddKnowledgeBaseJobResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  @ApiConflictResponse({
    description: 'If there are unfinished jobs, this error will be returned.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @RoleAccessLevel([
    AccessLevel.ADMIN,
    AccessLevel.MEMBER,
    AccessLevel.READ_ONLY,
  ])
  async addKnowledgeBaseJob(
    @Param() { orgId }: OrgIdParams,
    @Body() body: AddKnowledgeBaseToOrganizationDTO,
    @UploadedFiles(
      new CustomFileCountValidationPipe({
        minCount: MIN_FILE_COUNT,
        maxCount: MAX_FILE_COUNT,
      }),
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileMimeTypeValidator({
            fileExtensions: ALLOWED_UPLOADS_EXT_TYPES,
          }),
        )
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
      new ParseFilePipe({
        validators: [],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const crawl =
      typeof body?.crawl === 'string' ? JSON.parse(body?.crawl) : body.crawl;

    this.logger.log(`[POST] Start add knowledge base to organization`);

    const payload = {
      files,
      crawl,
      organizationId: orgId,
      name: body.name,
      type: body.type,
    };
    const result = await this.addKnowledgeBaseToOrganizationUseCase.exec(
      payload,
    );

    if (result.isLeft()) {
      const error = result.value;

      this.logger.error(
        `[POST] Add knowledge base error ${error.errorValue().message}`,
      );
      return errorHandler(error);
    }
    return result.value.getValue();
  }
}
