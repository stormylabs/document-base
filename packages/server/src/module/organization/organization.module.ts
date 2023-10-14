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
import {
  CrawlJobOrganization,
  CrawlJobOrganizationSchema,
} from './schemas/crawlJob.schema';
import { CrawlJobOrganizationRepository } from './repositories/crawlJob.repository';
import { CrawlJobOrganizationService } from './services/crawlJob.service';
import CreateCrawlJobOrganizationUseCase from './useCases/jobs/CreateCrawlJob';
import { SqsProducerModule } from '../sqsProducer/sqsProducer.module';
import { SqsConsumerModule } from '../sqsConsumer/sqsConsumer.module';
import CrawlWebsitesByOrganizationUseCase from './useCases/CrawlWebsitesByOrganizationUseCase';
import CrawlWebsiteOrganizationUseCase from './useCases/jobs/CrawlWebsite';
import { DocumentModule } from '../document/document.module';

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
        name: CrawlJobOrganization.name,
        schema: CrawlJobOrganizationSchema,
      },
    ]),
    ConfigModule,
    UserModule,
    SqsProducerModule,
    forwardRef(() => SqsConsumerModule),
    AuthModule,
    DocumentModule,
  ],
  controllers: [OrganizationController],
  providers: [
    // repo and service
    OrganizationRepository,
    OrganizationService,
    MemberRepository,
    MemberService,
    CrawlJobOrganizationRepository,
    CrawlJobOrganizationService,

    // use case & other
    InviteMemberToOrganizationUseCase,
    CreateOrganizationUseCase,
    GetOrganizationUseCase,
    CrawlWebsiteOrganizationUseCase,
    CreateCrawlJobOrganizationUseCase,
    CrawlWebsitesByOrganizationUseCase,
    OrganizationRoleGuard,
  ],
  exports: [OrganizationService, CrawlWebsiteOrganizationUseCase],
})
export class OrganizationModule {}
