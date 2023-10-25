import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStatus } from '@/shared/interfaces';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { DocumentDocument } from '@/module/bot/schemas/document.schema';
import { BotDocument } from '@/module/bot/schemas/bot.schema';
import { OrganizationDocument } from '@/module/organization/schemas/organization.schema';

export type ExtractFileJobDocument = HydratedDocument<ExtractFileJob>;

@Schema({ collection: 'ExtractFileJob' })
export class ExtractFileJob extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.Pending,
    required: true,
  })
  status: JobStatus;

  @Prop({ type: Types.ObjectId, ref: 'Bot' })
  bot: BotDocument;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization?: OrganizationDocument;

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

export const ExtractFileJobSchema =
  SchemaFactory.createForClass(ExtractFileJob);
ExtractFileJobSchema.set('toJSON', toJSONOverride);
