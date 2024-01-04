import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserData } from 'src/shared/interfaces/user';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(userData: Partial<UserData>): Promise<UserData> {
    const user = new this.userModel(userData);
    const saved = await user.save();
    return saved.toJSON() as UserData;
  }

  async findById(userId: string): Promise<UserData | null> {
    const id = new Types.ObjectId(userId);
    const user = await this.userModel.findById(id).exec();
    if (!user || user.deletedAt) return null;
    return user.toJSON() as UserData;
  }

  async findAll(): Promise<UserData[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => user.toJSON() as UserData);
  }

  async findUserByEmail(email: string): Promise<UserData | null> {
    const user = await this.userModel
      .findOne({
        email,
      })
      .exec();

    if (!user) return null;
    return user.toJSON() as UserData;
  }

  async exists(userIds: string[]): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ _id: { $in: userIds }, deletedAt: null })
      .exec();
    return count === userIds.length;
  }

  async emailsExists(emails: string[]): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: { $in: emails } })
      .exec();
    return count === emails.length;
  }

  async update(
    userId: string,
    data: Partial<Omit<UserData, 'createdAt' | '_id'>>,
  ): Promise<UserData | null> {
    const id = new Types.ObjectId(userId);
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return user.toJSON() as UserData;
  }

  async delete(userId: string): Promise<UserData> {
    const id = new Types.ObjectId(userId);
    const user = await this.userModel.findByIdAndDelete(id).exec();
    return user.toJSON() as UserData;
  }
}
