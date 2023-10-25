import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { DocumentDocument } from '@/module/bot/schemas/document.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ collection: 'Organization' })
export class Organization extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: String, maxlength: 50, default: 'default', required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documents: DocumentDocument[];

  @Prop({ type: String, maxlength: 2500, required: true })
  descriptions: string;

  @Prop({ type: String, maxlength: 1500, required: true })
  values: string;

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
