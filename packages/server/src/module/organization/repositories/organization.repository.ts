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
    const org = await this.orgModel.findById(id).populate('documents').exec();
    if (!org || org.deletedAt) return null;
    return org.toJSON() as OrganizationData;
  }

  async findAll(): Promise<OrganizationData[]> {
    const orgs = await this.orgModel.find().populate('documents').exec();
    return orgs.map((org) => org.toJSON() as OrganizationData);
  }

  async exists(orgIds: string[]): Promise<boolean> {
    const count = await this.orgModel
      .countDocuments({ _id: { $in: orgIds }, deletedAt: null })
      .populate('documents')
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

  async upsertDocuments(
    orgId: string,
    documentIds: string[],
  ): Promise<OrganizationData> {
    const id = new Types.ObjectId(orgId);
    const org = await this.orgModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { documents: { $each: documentIds } } },
        { new: true },
      )
      .populate('documents')
      .exec();
    return org.toJSON() as OrganizationData;
  }

  async removeDocuments(
    botId: string,
    documentIds: string[],
  ): Promise<OrganizationData> {
    const id = new Types.ObjectId(botId);
    const bot = await this.orgModel
      .findByIdAndUpdate(
        id,
        {
          $pullAll: { documents: documentIds },
        },
        { new: true },
      )
      .populate('documents')
      .exec();
    return bot.toJSON() as OrganizationData;
  }
}
