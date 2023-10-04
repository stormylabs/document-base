import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';

export type EngagementDocument = HydratedDocument<Engagement>;

@Schema({ collection: 'Engagement' })
export class Engagement extends Document {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  organisationId: string;

  @Prop({ type: Number })
  budgetPerInteraction: number;

  @Prop({ type: Date })
  executesAt: Date;

  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ type: String })
  templateId: string;

  @Prop({ type: [String] })
  contactIds: string[];

  @Prop({ type: [String] })
  channels: string[];

  @Prop({ type: [String] })
  knowledgeIds: string[];

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
EngagementSchema.index({ accessLevel: 1 });
EngagementSchema.set('toJSON', toJSONOverride);
