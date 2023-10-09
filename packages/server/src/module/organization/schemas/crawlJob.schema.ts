import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStatus } from '@/shared/interfaces';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { DocumentDocument } from '@/module/bot/schemas/document.schema';
import { DOCUMENT_LIMIT } from '@/shared/constants';
import { OrganizationDocument } from './organization.schema';

export type CrawlJobOrganizationDocument =
  HydratedDocument<CrawlJobOrganization>;

@Schema({ collection: 'CrawlJobOrganization' })
export class CrawlJobOrganization extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: Number,
    default: 1,
    min: 1,
    max: DOCUMENT_LIMIT,
  })
  limit: number;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.Pending,
    required: true,
  })
  status: JobStatus;

  @Prop({ type: Boolean, default: false, required: true })
  locked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization: OrganizationDocument;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documents: DocumentDocument[];

  @Prop({ type: Array, default: [], minlength: 1, maxlength: 10 })
  initUrls: string[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const CrawlJobOrganizationSchema =
  SchemaFactory.createForClass(CrawlJobOrganization);
CrawlJobOrganizationSchema.set('toJSON', toJSONOverride);
