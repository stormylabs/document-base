import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AccessLevel } from '../interfaces/accessLevel';
import { MemberResponse } from './member';
import { UserResponse } from './user';

class OrgMemberResponseDTO extends PartialType(
  PickType(MemberResponse, [
    '_id',
    'user',
    'createdAt',
    'accessLevel',
  ] as const),
) {
  _id: string;
  user: UserResponse;
  accessLevel: AccessLevel;
  createdAt: Date;
}

export class OrganizationResponse {
  @ApiProperty({
    description: 'Org ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'Org Name',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Member Documents',
    type: () => [OrgMemberResponseDTO],
  })
  members?: OrgMemberResponseDTO[];

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
