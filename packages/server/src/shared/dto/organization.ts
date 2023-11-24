import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { AccessLevel } from '../interfaces/accessLevel';
import { SafeMongoIdTransform } from '../utils/safeMongoIdTransform';
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
    required: true,
    example: '61d9cfbf17ed7311c4b3e485',
  })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  @Transform((value) => SafeMongoIdTransform(value))
  orgId: string;
}
