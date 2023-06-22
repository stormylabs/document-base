import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  Document as MongooseDocument,
  HydratedDocument,
  ObjectId,
} from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

enum DocumentType {
  Url = 'url',
  Pdf = 'pdf',
  Word = 'word',
  Image = 'image',
}

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
