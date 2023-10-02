import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MemberData } from 'src/shared/interfaces/member';
import { Member } from '../schemas/member.schema';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<Member>,
  ) {}

  async create(
    memberData: Partial<Omit<MemberData, 'user' | 'organization'>> & {
      userId: string;
      organizationId: string;
    },
  ): Promise<MemberData> {
    const member = new this.memberModel({
      user: new Types.ObjectId(memberData.userId),
      organization: new Types.ObjectId(memberData.organizationId),
    });
    const saved = await member.save();
    return saved.toJSON() as MemberData;
  }

  async findById(memberId: string): Promise<MemberData | null> {
    const id = new Types.ObjectId(memberId);
    const member = await this.memberModel
      .findById(id)
      .populate('user')
      .populate('organization')
      .exec();
    if (!member || member.deletedAt) return null;
    return member.toJSON() as MemberData;
  }

  async findAll(): Promise<MemberData[]> {
    const members = await this.memberModel.find().exec();
    return members.map((member) => member.toJSON() as MemberData);
  }

  async findMemberByUserId(userId: string): Promise<MemberData> {
    const user = new Types.ObjectId(userId);
    const member = await this.memberModel
      .findOne({
        user,
      })
      .populate('user')
      .populate('organization')
      .exec();

    if (!member) return null;
    return member?.toJSON() as MemberData;
  }

  async exists(memberIds: string[]): Promise<boolean> {
    const count = await this.memberModel
      .countDocuments({ _id: { $in: memberIds }, deletedAt: null })
      .exec();
    return count === memberIds.length;
  }

  async update(
    memberId: string,
    data: Partial<Omit<MemberData, 'createdAt' | '_id'>>,
  ): Promise<MemberData | null> {
    const id = new Types.ObjectId(memberId);
    const member = await this.memberModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return member.toJSON() as MemberData;
  }

  async delete(memberId: string): Promise<MemberData> {
    const id = new Types.ObjectId(memberId);
    const member = await this.memberModel.findByIdAndDelete(id).exec();
    return member.toJSON() as MemberData;
  }
}
