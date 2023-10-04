import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationService } from './services/organization.service';
import InviteMemberToOrganizationUseCase from './useCases/InviteMemberToOrganization';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationController } from './controllers/organization.controller';
import { Member, MemberSchema } from './schemas/member.schema';
import { MemberRepository } from './repositories/member.repository';
import { MemberService } from './services/member.service';
import { APP_GUARD } from '@nestjs/core';
import { OrganizationRoleGuard } from '@/shared/guards/OrganizationRole.guard';
import { ApiKeyGuard } from '@/shared/guards/ApiKey.guard';
import CreateOrganizationUseCase from './useCases/CreateOrganization';
import GetOrganizationUseCase from './useCases/GetOrganization';
import AddEngagementOrganizationUseCase from './useCases/AddEngagementToOrganization';
import { Engagement, EngagementSchema } from './schemas/engagement.schema';
import { EngagementService } from './services/engagement.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Organization.name,
        schema: OrganizationSchema,
      },
      {
        name: Member.name,
        schema: MemberSchema,
      },
      {
        name: Engagement.name,
        schema: EngagementSchema,
      },
    ]),
    ConfigModule,
    UserModule,
    AuthModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationRepository,
    OrganizationService,
    MemberRepository,
    MemberService,
    InviteMemberToOrganizationUseCase,
    CreateOrganizationUseCase,
    GetOrganizationUseCase,
    OrganizationRoleGuard,
    AddEngagementOrganizationUseCase,
  ],
  exports: [OrganizationService, MemberService, EngagementService],
})
export class OrganizationModule {}
