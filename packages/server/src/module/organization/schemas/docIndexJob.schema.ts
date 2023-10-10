import { OrganizationDocument } from '@/module/organization/schemas/organization.schema';
import { DocumentDocument } from '@/module/bot/schemas/document.schema';
import { JobStatus } from '@/shared/interfaces';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';

export type DocIndexOrgJobDocument = HydratedDocument<DocIndexOrgJob>;

@Schema({ collection: 'DocIndexOrgJob' })
export class DocIndexOrgJob extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.Pending,
    required: true,
  })
  status: JobStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documents: DocumentDocument[];

  @Prop({ type: Boolean, default: false, required: true })
  locked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization: OrganizationDocument;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const DocIndexOrgJobSchema =
  SchemaFactory.createForClass(DocIndexOrgJob);
DocIndexOrgJobSchema.set('toJSON', toJSONOverride);
