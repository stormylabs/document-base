import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  Document as MongooseDocument,
  HydratedDocument,
  ObjectId,
} from 'mongoose';
import { DocumentType } from '../../../shared/interfaces/document';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';

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

  @Prop({ type: String, required: true, unique: true })
  sourceName: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: Number })
  tokens?: number;

  @Prop({ type: Number })
  characters?: number;

  @Prop({ type: String })
  title?: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
DocumentSchema.set('toJSON', toJSONOverride);
