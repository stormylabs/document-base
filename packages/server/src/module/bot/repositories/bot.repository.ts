/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BotData } from 'src/shared/interfaces/bot';
import { Bot } from '../schemas/bot.schema';

@Injectable()
export class BotRepository {
  constructor(@InjectModel(Bot.name) private readonly botModel: Model<Bot>) {}

  async create(botData: Partial<BotData>): Promise<BotData> {
    const bot = new this.botModel(botData);
    const saved = await bot.save();
    return saved.toJSON() as BotData;
  }

  async findById(botId: string): Promise<BotData | null> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel.findById(id).populate('documents').exec();
    if (!bot || bot.deletedAt) return null;
    return bot.toJSON() as BotData;
  }

  async findAll(): Promise<BotData[]> {
    const bots = await this.botModel.find().populate('documents').exec();
    return bots.map((bot) => bot.toJSON() as BotData);
  }

  async exists(botIds: string[]): Promise<boolean> {
    const count = await this.botModel
      .countDocuments({ _id: { $in: botIds }, deletedAt: null })
      .exec();
    return count === botIds.length;
  }

  async update(
    botId: string,
    data: Partial<Omit<BotData, 'createdAt' | '_id'>>,
  ): Promise<BotData | null> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('documents')
      .exec();
    return bot.toJSON() as BotData;
  }

  async delete(botId: string): Promise<BotData> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel
      .findByIdAndDelete(id)
      .populate('documents')
      .exec();
    return bot.toJSON() as BotData;
  }

  async upsertDocuments(
    botId: string,
    documentIds: string[],
  ): Promise<BotData> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { documents: { $each: documentIds } } },
        { new: true },
      )
      .populate('documents')
      .exec();
    return bot.toJSON() as BotData;
  }

  async removeDocuments(
    botId: string,
    documentIds: string[],
  ): Promise<BotData> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel
      .findByIdAndUpdate(
        id,
        {
          $pullAll: { documents: documentIds },
        },
        { new: true },
      )
      .populate('documents')
      .exec();
    return bot.toJSON() as BotData;
  }
}
