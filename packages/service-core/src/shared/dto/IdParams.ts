import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsString } from 'class-validator';
import { SafeMongoIdTransform } from '@/shared/utils/safeMongoIdTransform';

export class IdParams {
  @ApiProperty({
    name: 'id',
    description: 'Entity Id',
    type: String,
    example: '61d9cfbf17ed7311c4b3e485',
  })
  @IsMongoId()
  @IsString()
  @Transform((value) => SafeMongoIdTransform(value))
  id: string;
}
