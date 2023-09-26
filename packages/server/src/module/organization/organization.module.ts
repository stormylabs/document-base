import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationService } from './services/organization.service';
import InviteUserToOrganizationUseCase from './useCases/InviteUserToOrganization';
import { UserModule } from '../user/user.module';
import { OrganizationGuard } from '@/shared/guards/OrganizationGuard.guard';
import { AuthModule } from '../auth/auth.module';
import { OrganizationController } from './controllers/organization.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Organization.name,
        schema: OrganizationSchema,
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
    InviteUserToOrganizationUseCase,
    OrganizationGuard,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
