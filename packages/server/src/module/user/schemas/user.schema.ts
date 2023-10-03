import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { MemberDocument } from '@/module/organization/schemas/member.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'User' })
export class User extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    maxlength: 320,
    default: 'default',
    required: true,
    unique: true,
    trim: true,
    immutable: true,
  })
  email: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
UserSchema.set('toJSON', toJSONOverride);
