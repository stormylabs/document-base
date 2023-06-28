import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStatus } from '@/shared/interfaces';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';

export type CrawlJobDocument = HydratedDocument<CrawlJob>;

@Schema({ collection: 'CrawlJob' })
export class CrawlJob extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Number, default: 1, min: 1, max: 2000 })
  limit: number;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.Pending,
    required: true,
  })
  status: JobStatus;

  @Prop({ type: Types.ObjectId })
  botId: string;

  @Prop({ type: Array, default: [], minlength: 1, maxlength: 10 })
  initUrls: string[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const CrawlJobSchema = SchemaFactory.createForClass(CrawlJob);
CrawlJobSchema.set('toJSON', toJSONOverride);
