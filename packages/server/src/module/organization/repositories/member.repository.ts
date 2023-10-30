import { AccessLevel } from '@/shared/interfaces/accessLevel';
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
      accessLevel?: AccessLevel;
    },
  ): Promise<MemberData> {
    const member = new this.memberModel({
      user: new Types.ObjectId(memberData.userId),
      organization: new Types.ObjectId(memberData.organizationId),
      accessLevel: memberData.accessLevel || AccessLevel.ADMIN,
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

  async findMemberByUserId(queries: {
    userId: string;
    organizationId: string;
  }): Promise<MemberData> {
    const finalQueries: {
      user?: Types.ObjectId;
      organization?: Types.ObjectId;
    } = {};

    if (queries?.userId) finalQueries.user = new Types.ObjectId(queries.userId);
    if (queries?.organizationId)
      finalQueries.organization = new Types.ObjectId(queries.organizationId);

    const member = await this.memberModel
      .findOne(finalQueries)
      .populate('user')
      .populate('organization')
      .exec();

    if (!member) return null;
    return member?.toJSON() as MemberData;
  }

  async findMembersByOrgId(orgId: string): Promise<MemberData[]> {
    const organization = new Types.ObjectId(orgId);
    const members = await this.memberModel
      .find({
        organization,
      })
      .populate('user')
      .exec();

    if (!members) return null;
    return members.map((member) => member.toJSON() as MemberData);
  }

  async findOneByUserIdOrgId(data: {
    userId?: string;
    organizationId?: string;
  }): Promise<MemberData> {
    const query = {};
    if (data.userId) {
      query['user'] = new Types.ObjectId(data.userId);
    }
    if (data.organizationId) {
      query['organization'] = new Types.ObjectId(data.organizationId);
    }

    const member = await this.memberModel
      .findOne({
        ...query,
        deletedAt: null,
      })
      .populate('organization')
      .populate('user')
      .exec();
    if (!member) return null;
    return member.toJSON() as MemberData;
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
