import { forwardRef, Module } from '@nestjs/common';
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
import { OrganizationRoleGuard } from '@/shared/guards/OrganizationRole.guard';
import CreateOrganizationUseCase from './useCases/CreateOrganization';
import GetOrganizationUseCase from './useCases/GetOrganization';
import AddEngagementOrganizationUseCase from './useCases/AddEngagementToOrganization';
import { Engagement, EngagementSchema } from './schemas/engagement.schema';
import { EngagementService } from './services/engagement.service';
import { EngagementRepository } from './repositories/engagement.repository';
import GetEngagementUseCase from './useCases/GetEngagement';
import { BotModule } from '../bot/bot.module';
import { S3Module } from '../s3/s3.module';
import {
  KnowledgeBase,
  KnowledgeBaseSchema,
} from './schemas/knowledgeBase.schema';
import {
  AddKnowledgeBaseJob,
  AddKnowledgeBaseJobSchema,
} from './schemas/addKnowledgeBaseJob.schema';
import { KnowledgeBaseRepository } from './repositories/knowledgeBase.repository';
import { AddKnowledgeBaseJobRepository } from './repositories/addKnowledgeBaseJob.repository';
import { KnowledgeBaseService } from './services/knowledgeBase.service';
import { AddKnowledgeBaseJobService } from './services/addKnowledgeBaseJob.service';
import AddKnowledgeBaseToOrganizationUseCase from './useCases/AddKnowledgeBaseToOrganization';

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
      {
        name: KnowledgeBase.name,
        schema: KnowledgeBaseSchema,
      },
      {
        name: AddKnowledgeBaseJob.name,
        schema: AddKnowledgeBaseJobSchema,
      },
    ]),
    ConfigModule,
    UserModule,
    AuthModule,
    forwardRef(() => BotModule),
    S3Module,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationRepository,
    OrganizationService,
    MemberRepository,
    MemberService,
    KnowledgeBaseRepository,
    KnowledgeBaseService,
    AddKnowledgeBaseJobRepository,
    AddKnowledgeBaseJobService,
    InviteMemberToOrganizationUseCase,
    CreateOrganizationUseCase,
    GetOrganizationUseCase,
    OrganizationRoleGuard,
    EngagementService,
    EngagementRepository,
    AddEngagementOrganizationUseCase,
    GetEngagementUseCase,
    AddKnowledgeBaseToOrganizationUseCase,
  ],
  exports: [OrganizationService, MemberService, EngagementService],
})
export class OrganizationModule {}
