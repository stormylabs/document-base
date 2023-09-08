import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { BotDocument } from '@/module/bot/schemas/bot.schema';
import { UserDocument } from '@/module/user/schemas/user.schema';
import { BillableResource } from '@/shared/interfaces/usage';

export type ResourceUsageDocument = HydratedDocument<ResourceUsage>;

@Schema({ collection: 'ResourceUsage' })
export class ResourceUsage extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Bot' })
  bot: BotDocument;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: UserDocument;

  @Prop({
    type: String,
    enum: BillableResource,
    default: BillableResource.Message,
    required: true,
  })
  resource: BillableResource;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;
}

export const ResourceUsageSchema = SchemaFactory.createForClass(ResourceUsage);
ResourceUsageSchema.index({ user: 1 });
ResourceUsageSchema.index({ bot: 1 });
ResourceUsageSchema.set('toJSON', toJSONOverride);
