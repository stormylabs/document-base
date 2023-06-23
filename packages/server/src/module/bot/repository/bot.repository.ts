import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BotData } from 'src/shared/interfaces/bot';
import { Bot } from '../schemas/Bot.schema';

@Injectable()
export class BotRepository {
  constructor(@InjectModel(Bot.name) private readonly botModel: Model<Bot>) {}

  async create(botData: Partial<Bot>): Promise<BotData> {
    const bot = new this.botModel(botData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...rest } = (await bot.save()).toJSON();
    return rest as BotData;
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
