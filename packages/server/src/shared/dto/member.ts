import { OrganizationDocument } from '@/module/organization/schemas/organization.schema';
import { UserDocument } from '@/module/user/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserResponse } from './user';

export class OrganizationResponse {
  @ApiProperty({
    description: 'Org ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'User Documents',
    type: () => UserResponse,
  })
  user: UserDocument;

  @ApiProperty({
    description: 'Organization Documents',
    type: () => OrganizationResponse,
  })
  organization: OrganizationDocument;

  @ApiProperty({
    description: 'Org Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Org Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}

export class OrgIdParams {
  @ApiProperty({
    name: 'orgId',
    type: String,
    description: 'Organization ID',
  })
  @IsString()
  @IsNotEmpty()
  orgId: string;
}
