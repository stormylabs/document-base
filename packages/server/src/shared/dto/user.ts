import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'User Email',
    type: String,
  })
  email?: string;

  @ApiProperty({
    description: 'User Created Date',
    type: Date,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'User Updated Date',
    type: Date,
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'User Deleted Date',
    type: Date,
  })
  deletedAt?: Date;
}
