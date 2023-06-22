import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bot } from '../schemas/Bot.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class BotRepository {
  constructor(
    @InjectModel(Bot.name) private readonly botModel: Model<Bot>, // @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(botData: Partial<Bot>): Promise<Bot> {
    const bot = new this.botModel(botData);
    return await bot.save();
  }

  async findById(botId: string): Promise<Bot | null> {
    return await this.botModel.findById(botId).exec();
  }

  async findAll(): Promise<Bot[]> {
    return await this.botModel.find().exec();
  }

  async update(botId: string, updateData: Partial<Bot>): Promise<Bot | null> {
    return await this.botModel
      .findByIdAndUpdate(botId, updateData, { new: true })
      .exec();
  }

  async delete(botId: string): Promise<Bot | null> {
    return await this.botModel.findByIdAndDelete(botId).exec();
  }
}
