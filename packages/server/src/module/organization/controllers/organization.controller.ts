import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { errorHandler } from '@/shared/http';

import InviteMemberToOrganizationDTO from '../useCases/InviteMemberToOrganization/dto';
import InviteMemberToOrganizationUseCase from '../useCases/InviteMemberToOrganization';
import { AccessLevel } from '@/shared/interfaces/accessLevel';
import { RoleAccessLevel } from '@/shared/decorators/RoleAccessLevel.decorator';
import { RequestWithUser } from '@/shared/interfaces/requestWithUser';
import { left } from '@/shared/core/Result';
import { UnauthorizedError } from '@/shared/core/AppError';
import { OrgIdParams } from '@/shared/dto/organization';
import CreateOrganizationDTO, {
  CreateOrganizationResponseDto,
} from '../useCases/CreateOrganization/dto';
import CreateOrganizationUseCase from '../useCases/CreateOrganization';

@ApiSecurity('x-api-key')
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private createOrgUseCase: CreateOrganizationUseCase,
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
  @RoleAccessLevel(AccessLevel.ADMIN)
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
  @RoleAccessLevel(AccessLevel.ADMIN)
  async inviteUserToOrg(
    @Body() body: InviteMemberToOrganizationDTO,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @Param() param: OrgIdParams,
  ) {
    const { email } = body;
    this.logger.log(`[POST] Start invite user to organization`);

    console.log(req?.user?.member?.organization?._id, param.orgId);

    // * check org ownership
    if (req?.user?.member?.organization?._id !== param.orgId) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return left(new UnauthorizedError());
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

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
