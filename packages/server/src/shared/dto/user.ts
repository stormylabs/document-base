import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserResponse {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'User Email',
    type: String,
    example: 'example@example.com',
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

export class UserIdParams {
  @ApiProperty({ name: 'userId', type: String, description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
