import { BotDocument } from '@/module/bot/schemas/bot.schema';
import { JobStatus } from '@/shared/interfaces';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';

export type DocIndexJobDocument = HydratedDocument<DocIndexJob>;

@Schema({ collection: 'DocIndexJob' })
export class DocIndexJob extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.Pending,
    required: true,
  })
  status: JobStatus;

  @Prop({ type: Number, default: 0 })
  indexed: number;

  @Prop({ type: Boolean, default: false, required: true })
  locked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Bot' })
  bot: BotDocument;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const DocIndexJobSchema = SchemaFactory.createForClass(DocIndexJob);
DocIndexJobSchema.set('toJSON', toJSONOverride);
