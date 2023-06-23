import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

class ParamWithId {
  @ApiProperty({ name: 'id', type: 'string' })
  id: ObjectId;
}

export default ParamWithId;
