import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user';

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
    description: 'User Documents',
    type: () => [UserResponse],
  })
  members?: UserResponse[];

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
