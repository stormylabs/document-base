import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  Document as MongooseDocument,
  HydratedDocument,
  ObjectId,
} from 'mongoose';
import { DocumentType } from '../../../shared/interfaces/document';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ collection: 'Document' })
export class Document extends MongooseDocument {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    enum: DocumentType,
    default: DocumentType.Url,
    required: true,
  })
  type: DocumentType;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  text: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
DocumentSchema.index({ name: 1 });
