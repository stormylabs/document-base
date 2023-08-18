import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'User' })
export class User extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, maxlength: 64, default: 'default', required: true })
  email: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ name: 1 });
UserSchema.set('toJSON', toJSONOverride);
