import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import { toJSONOverride } from '@/shared/mongo/schemaOverride';
import { BotDocument } from '@/module/bot/schemas/bot.schema';
import { UserDocument } from '@/module/user/schemas/user.schema';

export type BotUsageDocument = HydratedDocument<BotUsage>;

@Schema({ collection: 'BotUsage' })
export class BotUsage extends Document {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Bot' })
  bot: BotDocument;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: UserDocument;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const BotUsageSchema = SchemaFactory.createForClass(BotUsage);
BotUsageSchema.index({ user: 1 });
BotUsageSchema.index({ bot: 1 });
BotUsageSchema.set('toJSON', toJSONOverride);
