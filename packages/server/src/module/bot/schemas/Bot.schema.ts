import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { DocumentDocument } from './Document.schema';

export type BotDocument = HydratedDocument<Bot>;

@Schema({ collection: 'Bot' })
export class Bot extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, maxlength: 50, default: 'default', required: true })
  name: string;

  @Prop({ type: String })
  crawlJobId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documents: DocumentDocument[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
BotSchema.index({ name: 1 });
