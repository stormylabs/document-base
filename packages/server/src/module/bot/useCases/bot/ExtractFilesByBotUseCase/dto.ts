import { JobStatus } from '@/shared/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export default class ExtractFilesByByBotDTO {
  @ApiProperty({
    type: 'array', // 👈  array of files
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Files of the bot',
  })
  files: Array<Express.Multer.File>;
}

export class ExtractFilesByBotResponseDTO {
  @ApiProperty({
    description: 'Extract files job id',
    type: String,
  })
  jobId: string;

  @ApiProperty({
    description: 'Extract files job status',
    enum: JobStatus,
  })
  status: JobStatus;
}
