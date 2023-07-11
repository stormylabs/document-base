import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesService } from './services/files.service';

@Module({
  imports: [ConfigModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
