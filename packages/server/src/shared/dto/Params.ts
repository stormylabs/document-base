import { ApiProperty } from '@nestjs/swagger';

class ParamBotId {
  @ApiProperty({ name: 'Bot ID', type: String })
  botId: string;
}

export default ParamBotId;
