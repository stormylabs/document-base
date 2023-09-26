import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationData } from 'src/shared/interfaces/organization';
import { Organization } from '../schemas/organization.schema';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel(Organization.name)
    private readonly orgModel: Model<Organization>,
  ) {}

  async create(orgData: Partial<OrganizationData>): Promise<OrganizationData> {
    const org = new this.orgModel(orgData);
    const saved = await org.save();
    return saved.toJSON() as OrganizationData;
  }

  async findById(orgId: string): Promise<OrganizationData | null> {
    const id = new Types.ObjectId(orgId);
    const org = await this.orgModel.findById(id).exec();
    if (!org || org.deletedAt) return null;
    return org.toJSON() as OrganizationData;
  }

  async findAll(): Promise<OrganizationData[]> {
    const orgs = await this.orgModel.find().exec();
    return orgs.map((org) => org.toJSON() as OrganizationData);
  }

  async exists(orgIds: string[]): Promise<boolean> {
    const count = await this.orgModel
      .countDocuments({ _id: { $in: orgIds }, deletedAt: null })
      .exec();
    return count === orgIds.length;
  }

  async update(
    orgId: string,
    data: Partial<Omit<OrganizationData, 'createdAt' | '_id'>>,
  ): Promise<OrganizationData | null> {
    const id = new Types.ObjectId(orgId);
    const org = await this.orgModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return org.toJSON() as OrganizationData;
  }

  async delete(orgId: string): Promise<OrganizationData> {
    const id = new Types.ObjectId(orgId);
    const org = await this.orgModel.findByIdAndDelete(id).exec();
    return org.toJSON() as OrganizationData;
  }

  async upsertMembers(
    orgId: string,
    memberIds: string[],
  ): Promise<OrganizationData> {
    const id = new Types.ObjectId(orgId);
    const org = await this.orgModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { members: { $each: memberIds } } },
        { new: true },
      )
      .populate('members')
      .exec();
    return org.toJSON() as OrganizationData;
  }
}
