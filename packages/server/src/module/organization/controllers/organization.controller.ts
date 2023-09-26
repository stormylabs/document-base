import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
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

import InviteUserToOrganizationDTO from '../useCases/InviteUserToOrganization/dto';
import InviteUserToOrganizationUseCase from '../useCases/InviteUserToOrganization';
import { ApiKeyGuard } from '@/shared/guards/ApiKeyGuard.guard';
import { OrganizationGuard } from '@/shared/guards/OrganizationGuard.guard';

@UseGuards(ApiKeyGuard)
@UseGuards(OrganizationGuard)
@ApiSecurity('x-api-key')
@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private inviteUserToOrgUseCase: InviteUserToOrganizationUseCase,
  ) {}

  @Post()
  @ApiBody({ type: InviteUserToOrganizationDTO })
  @ApiOperation({
    summary: 'Invite user to organization',
  })
  @ApiCreatedResponse({
    description: 'User added to organization',
  })
  @ApiConflictResponse({
    description: 'Email already exists.',
  })
  async inviteUserToOrg(
    @Body() body: InviteUserToOrganizationDTO,
    @Res() res: Response,
  ) {
    const { email, organizationId } = body;
    this.logger.log(`[POST] Start invite user to organization`);

    const result = await this.inviteUserToOrgUseCase.exec(
      organizationId,
      email,
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

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
