import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';

export type FileDocument = HydratedDocument<File>;

@Schema({ collection: 'File' })
export class File extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, default: 'default', required: true })
  name: string;

  @Prop({ type: String, default: 'default', required: true })
  url: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index({ name: 1 });
FileSchema.set('toJSON', toJSONOverride);
