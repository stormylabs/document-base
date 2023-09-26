import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationService } from './services/organization.service';
import InviteUserToOrganizationUseCase from './useCases/InviteUserToOrganisation';
import { UserModule } from '../user/user.module';

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
  ],
  controllers: [],
  providers: [
    OrganizationRepository,
    OrganizationService,
    InviteUserToOrganizationUseCase,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
