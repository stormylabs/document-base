/* eslint-disable @typescript-eslint/no-unused-vars */
import { DocIndexJobData } from '@/shared/interfaces/docIndexJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocIndexJob } from '../schemas/docIndexJob.schema';
import { JobStatus } from '@/shared/interfaces';

@Injectable()
export class DocIndexJobRepository {
  constructor(
    @InjectModel(DocIndexJob.name)
    private readonly docIndexJobModel: Model<DocIndexJob>,
  ) {}

  async create(
    docIndexJobData: Partial<DocIndexJobData>,
  ): Promise<DocIndexJobData> {
    const docIndexJob = new this.docIndexJobModel(docIndexJobData);
    const created = await docIndexJob.save();
    return created.toJSON() as DocIndexJobData;
  }

  async findById(docIndexJobId: string): Promise<DocIndexJobData | null> {
    const docIndexJob = await this.docIndexJobModel
      .findById(docIndexJobId)
      .exec();
    if (!docIndexJob) return null;
    return docIndexJob.toJSON() as DocIndexJobData;
  }

  async exists(docIndexJobIds: string[]): Promise<boolean> {
    const docIndexJobs = await this.docIndexJobModel
      .find({ _id: { $in: docIndexJobIds } })
      .exec();
    return docIndexJobs.length === docIndexJobIds.length;
  }

  async findAll(): Promise<DocIndexJobData[]> {
    const docIndexJobs = await this.docIndexJobModel.find().exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexJobData,
    );
  }

  async delete(docIndexJobId: string): Promise<DocIndexJobData> {
    const id = new Types.ObjectId(docIndexJobId);
    const docIndexJob = await this.docIndexJobModel
      .findByIdAndDelete(id)
      .exec();
    return docIndexJob.toJSON() as DocIndexJobData;
  }

  async update(
    docIndexJobId: string,
    data: Partial<{ status: JobStatus; deletedAt: Date }>,
  ): Promise<DocIndexJobData | null> {
    const id = new Types.ObjectId(docIndexJobId);
    const docIndexJob = await this.docIndexJobModel.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
      },
    );
    return docIndexJob.toJSON() as DocIndexJobData;
  }

  async incrementIndexedCount(docIndexJobId: string) {
    const id = new Types.ObjectId(docIndexJobId);
    const docIndexJob = await this.docIndexJobModel.findByIdAndUpdate(
      id,
      { $inc: { indexedCount: 1 } },
      { new: true },
    );
    return docIndexJob.toJSON() as DocIndexJobData;
  }
}
