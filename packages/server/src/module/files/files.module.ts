import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FileRepository } from './repositories/file.repository';
import { File, FileSchema } from './schemas/file.schema';

import { FilesService } from './services/files.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
  ],
  providers: [FileRepository, FilesService],
  exports: [FileRepository, FilesService],
})
export class FilesModule {}
