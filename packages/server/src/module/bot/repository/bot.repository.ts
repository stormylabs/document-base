/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BotData } from 'src/shared/interfaces/bot';
import { Bot } from '../schemas/bot.schema';

@Injectable()
export class BotRepository {
  constructor(@InjectModel(Bot.name) private readonly botModel: Model<Bot>) {}

  async create(botData: Partial<Bot>): Promise<BotData> {
    const bot = new this.botModel(botData);
    const { __v, ...rest } = (await bot.save()).toJSON();
    return rest as BotData;
  }

  async findById(botId: string): Promise<BotData | null> {
    const bot = await this.botModel.findById(botId).exec();
    if (!bot) return null;
    const { __v, ...rest } = bot.toJSON();
    return rest as BotData;
  }

  async findAll(): Promise<BotData[]> {
    const bots = await this.botModel.find().exec();
    return bots.map((bot) => {
      const { __v, ...rest } = bot.toJSON();
      return rest as BotData;
    });
  }

  async update(
    botId: string,
    updateData: Partial<Bot>,
  ): Promise<BotData | null> {
    const id = new Types.ObjectId(botId);
    const bot = await this.botModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!bot) return null;
    const { __v, ...rest } = bot.toJSON();
    return rest as BotData;
  }

  async delete(botId: string): Promise<Bot | null> {
    return await this.botModel.findByIdAndDelete(botId).exec();
  }
}
