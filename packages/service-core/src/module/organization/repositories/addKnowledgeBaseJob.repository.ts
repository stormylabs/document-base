import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddKnowledgeBaseJobData } from '@/shared/interfaces/addKnowledgeBaseJob';
import { AddKnowledgeBaseJob } from '../schemas/addKnowledgeBaseJob.schema';

@Injectable()
export class AddKnowledgeBaseJobRepository {
  constructor(
    @InjectModel(AddKnowledgeBaseJob.name)
    private readonly addKnowledgeBaseJobModel: Model<AddKnowledgeBaseJob>,
  ) {}

  async create(
    addKnowledgeBaseJobData: Partial<
      Omit<
        AddKnowledgeBaseJobData,
        'organization' | 'knowledgeBase' | 'crawlJob' | 'extractFileJob'
      >
    > & {
      organizationId: string;
      knowledgeBaseId: string;
      crawlJobId?: string;
      extractFileJobId?: string;
    },
  ): Promise<AddKnowledgeBaseJobData> {
    const addKnowledgeBaseJob = new this.addKnowledgeBaseJobModel({
      organization: new Types.ObjectId(addKnowledgeBaseJobData.organizationId),
      knowledgeBase: new Types.ObjectId(
        addKnowledgeBaseJobData.knowledgeBaseId,
      ),
      crawlJob: new Types.ObjectId(addKnowledgeBaseJobData.crawlJobId),
      extractFileJob: new Types.ObjectId(
        addKnowledgeBaseJobData.extractFileJobId,
      ),
    });
    const saved = await addKnowledgeBaseJob.save();
    return saved.toJSON() as AddKnowledgeBaseJobData;
  }

  async findById(
    addKnowledgeBaseJobId: string,
  ): Promise<AddKnowledgeBaseJobData | null> {
    const id = new Types.ObjectId(addKnowledgeBaseJobId);
    const addKnowledgeBaseJob = await this.addKnowledgeBaseJobModel
      .findById(id)
      .populate('organization')
      .populate('knowledgeBase')
      .populate('crawlJob')
      .populate('extractFileJob')
      .exec();
    if (!addKnowledgeBaseJob || addKnowledgeBaseJob.deletedAt) return null;
    return addKnowledgeBaseJob.toJSON() as AddKnowledgeBaseJobData;
  }

  async findAll(): Promise<AddKnowledgeBaseJobData[]> {
    const addKnowledgeBaseJobs = await this.addKnowledgeBaseJobModel
      .find()
      .exec();
    return addKnowledgeBaseJobs.map(
      (addKnowledgeBaseJob) =>
        addKnowledgeBaseJob.toJSON() as AddKnowledgeBaseJobData,
    );
  }

  async findByOrgId(orgId: string): Promise<AddKnowledgeBaseJobData[]> {
    const organization = new Types.ObjectId(orgId);
    const addKnowledgeBaseJobs = await this.addKnowledgeBaseJobModel
      .find({
        organization,
      })
      .exec();

    if (!addKnowledgeBaseJobs) return null;
    return addKnowledgeBaseJobs.map(
      (addKnowledgeBaseJob) =>
        addKnowledgeBaseJob.toJSON() as AddKnowledgeBaseJobData,
    );
  }

  async exists(addKnowledgeBaseJobIds: string[]): Promise<boolean> {
    const count = await this.addKnowledgeBaseJobModel
      .countDocuments({ _id: { $in: addKnowledgeBaseJobIds }, deletedAt: null })
      .exec();
    return count === addKnowledgeBaseJobIds.length;
  }

  async update(
    addKnowledgeBaseJobId: string,
    data: Partial<Omit<AddKnowledgeBaseJobData, 'createdAt' | '_id'>>,
  ): Promise<AddKnowledgeBaseJobData | null> {
    const id = new Types.ObjectId(addKnowledgeBaseJobId);
    const addKnowledgeBaseJob = await this.addKnowledgeBaseJobModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return addKnowledgeBaseJob.toJSON() as AddKnowledgeBaseJobData;
  }

  async delete(
    addKnowledgeBaseJobId: string,
  ): Promise<AddKnowledgeBaseJobData> {
    const id = new Types.ObjectId(addKnowledgeBaseJobId);
    const addKnowledgeBaseJob = await this.addKnowledgeBaseJobModel
      .findByIdAndDelete(id)
      .exec();
    return addKnowledgeBaseJob.toJSON() as AddKnowledgeBaseJobData;
  }
}
