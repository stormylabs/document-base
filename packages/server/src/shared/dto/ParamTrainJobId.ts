import { ApiProperty } from '@nestjs/swagger';

class ParamTrainJobId {
  @ApiProperty({ name: 'Train Job ID', type: String })
  trainJobId: string;
}

export default ParamTrainJobId;
