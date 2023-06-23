import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

class ParamWithId {
  @ApiProperty({ name: 'id', type: 'string' })
  @IsMongoId()
  id: string;
}

export default ParamWithId;
