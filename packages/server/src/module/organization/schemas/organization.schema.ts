import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { UserDocument } from '@/module/user/schemas/user.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ collection: 'Organization' })
export class Organization extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, maxlength: 50, default: 'default', required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: UserDocument[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ name: 1 });
OrganizationSchema.set('toJSON', toJSONOverride);
