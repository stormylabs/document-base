import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { OrganizationDocument } from './organization.schema';
import { KnowledgeBaseDocument } from './knowledgeBase.schema';
import { CrawlJobDocument } from '@/module/bot/schemas/crawlJob.schema';
import { ExtractFileJobDocument } from '@/module/bot/schemas/extractFileJob.schema';

export type AddKnowledgeBaseJobDocument = HydratedDocument<AddKnowledgeBaseJob>;

@Schema({ collection: 'AddKnowledgeBaseJob' })
export class AddKnowledgeBaseJob extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: OrganizationDocument;

  @Prop({ type: Types.ObjectId, ref: 'AddKnowledgeBaseJob', required: true })
  knowledgeBase: KnowledgeBaseDocument;

  @Prop({ type: Types.ObjectId, ref: 'CrawlJob' })
  crawlJob: CrawlJobDocument;

  @Prop({ type: Types.ObjectId, ref: 'ExtractFileJob' })
  extractFileJob: ExtractFileJobDocument;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const AddKnowledgeBaseJobSchema =
  SchemaFactory.createForClass(AddKnowledgeBaseJob);
AddKnowledgeBaseJobSchema.set('toJSON', toJSONOverride);
