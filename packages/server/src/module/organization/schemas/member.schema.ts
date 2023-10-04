import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { AccessLevel } from '@/shared/interfaces/accessLevel';
import { UserDocument } from '@/module/user/schemas/user.schema';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ collection: 'Member' })
export class Member extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: UserDocument;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization: Types.ObjectId;

  @Prop({ type: String, enum: AccessLevel, default: AccessLevel.MEMBER })
  accessLevel: AccessLevel;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ accessLevel: 1 });
MemberSchema.set('toJSON', toJSONOverride);
