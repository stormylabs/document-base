import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentRepository } from './repositories/document.repository';
import { Document, DocumentSchema } from './schemas/document.schema';
import { DocumentService } from './services/document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Document.name,
        schema: DocumentSchema,
      },
    ]),
    ConfigModule,
  ],
  controllers: [],
  providers: [DocumentRepository, DocumentService],
  exports: [DocumentRepository, DocumentService],
})
export class DocumentModule {}
