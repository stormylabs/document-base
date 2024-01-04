import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccessLevel } from '../interfaces/accessLevel';
import { OrganizationResponse } from './organization';
import { UserResponse } from './user';

export class MemberResponse {
  @ApiProperty({
    description: 'Org ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'User Documents',
    type: () => UserResponse,
  })
  user: UserResponse;

  @ApiProperty({
    description: 'Organization Documents',
    type: () => OrganizationResponse,
  })
  organization: OrganizationResponse;

  @ApiProperty({
    description: 'Access Level of Member',
    enum: AccessLevel,
  })
  accessLevel: AccessLevel;

  @ApiProperty({
    description: 'Member Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Member Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Member Deleted Date',
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
