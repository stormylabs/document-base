import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { UserDocument } from './user.schema';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ collection: 'ApiKey' })
export class ApiKey extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    maxlength: 256,
    required: true,
    unique: true,
  })
  apiKey: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: UserDocument;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
ApiKeySchema.index({ name: 1 });
ApiKeySchema.set('toJSON', toJSONOverride);
