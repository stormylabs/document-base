import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { KnowledgeBaseType } from '@/shared/interfaces';
import { OrganizationDocument } from './organization.schema';
import { DocumentDocument } from '@/module/bot/schemas/document.schema';

export type KnowledgeBaseDocument = HydratedDocument<KnowledgeBase>;

@Schema({ collection: 'KnowledgeBase' })
export class KnowledgeBase extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    maxlength: 50,
    default: 'default',
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    enum: KnowledgeBaseType,
    default: KnowledgeBaseType.ProductSearch,
  })
  type: KnowledgeBaseType;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: OrganizationDocument;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }] })
  documents: DocumentDocument[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const KnowledgeBaseSchema = SchemaFactory.createForClass(KnowledgeBase);
KnowledgeBaseSchema.set('toJSON', toJSONOverride);
