import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { SafeMongoIdTransform } from '@/shared/utils/safeMongoIdTransform';

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
  @ApiProperty({
    name: 'userId',
    type: String,
    description: 'User ID',
    required: true,
    example: '61d9cfbf17ed7311c4b3e485',
  })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  @Transform((value) => SafeMongoIdTransform(value))
  userId: string;
}

export class RevealAPIKeyParams extends UserIdParams {
  @ApiProperty({ name: 'apiKeyId', type: String, description: 'API Key ID' })
  @IsString()
  @IsNotEmpty()
  apiKeyId: string;
}
