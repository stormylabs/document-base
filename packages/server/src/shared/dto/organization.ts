import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
