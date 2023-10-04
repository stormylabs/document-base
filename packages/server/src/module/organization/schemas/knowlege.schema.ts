import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { KnowledgeType } from '@/shared/interfaces/knowledgeType';
import { OrganizationData } from '@/shared/interfaces/organization';

// Interfacwe for Knowledge
// class KnowledgeBase {
//     _id: string;
//     name: string;
//     organisation: Organisation
//     type: KnowledgeType
//     descriptions: string <-- on the FE we provide a tool template string to help users to succinctly create a description string for LLM to identify
//     document: Document <-- reuse the flow for document creation e.g. pdf, word, website
//     createdAt: Date;
//     deletedAt: Date;
// }

export type KnowledgeDocument = HydratedDocument<Knowledge>;

@Schema({ collection: 'Knowledge' })
export class Knowledge extends Document {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organisation: OrganizationData;

  @Prop({ type: KnowledgeType })
  type: KnowledgeType;

  @Prop({ type: String })
  descriptions: string;

  @Prop({ type: Document })
  document: Document;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);
KnowledgeSchema.index({ accessLevel: 1 });
KnowledgeSchema.set('toJSON', toJSONOverride);
