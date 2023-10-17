import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { OrganizationDocument } from './organization.schema';

export type EngagementDocument = HydratedDocument<Engagement>;

@Schema({ collection: 'Engagement' })
export class Engagement extends Document {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({
    type: String,
    maxlength: 50,
    default: 'New Engagement',
    required: true,
  })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization: OrganizationDocument;

  @Prop({ type: Number, default: 0 })
  budgetPerInteraction: number;

  @Prop({ type: Date })
  executesAt: Date;

  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ type: String })
  templateId: string;

  @Prop({ type: [String] })
  contacts: string[];

  @Prop({ type: [String] })
  channels: string[];

  @Prop({ type: [String] })
  knowledgeBases: string[];

  @Prop({ type: String })
  agentId: string;

  @Prop({ type: String })
  outcome: string;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}
export const EngagementSchema = SchemaFactory.createForClass(Engagement);
EngagementSchema.set('toJSON', toJSONOverride);
