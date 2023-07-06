/* eslint-disable @typescript-eslint/no-unused-vars */
import { DocIndexJobData } from '@/shared/interfaces/docIndexJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocIndexJob } from '../schemas/docIndexJob.schema';
import { JobStatus } from '@/shared/interfaces';
import { JOB_TIMEOUT } from '@/shared/constants';

@Injectable()
export class DocIndexJobRepository {
  constructor(
    @InjectModel(DocIndexJob.name)
    private readonly docIndexJobModel: Model<DocIndexJob>,
  ) {}

  async create(
    docIndexJobData: Partial<DocIndexJobData>,
  ): Promise<DocIndexJobData> {
    const botId = new Types.ObjectId(docIndexJobData.bot);
    const docIndexJob = new this.docIndexJobModel({
      ...docIndexJobData,
      bot: botId,
    });
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

  async findAllByBotId(botId: string): Promise<DocIndexJobData[]> {
    const id = new Types.ObjectId(botId);
    const docIndexJobs = await this.docIndexJobModel.find({ bot: id }).exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexJobData,
    );
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<DocIndexJobData[]> {
    const timeout = Date.now() - JOB_TIMEOUT;
    const docIndexJobs = await this.docIndexJobModel
      .find({
        status,
        updatedAt: {
          $lt: new Date(timeout),
        },
      })
      .exec();
    return docIndexJobs.map((crawlJob) => crawlJob.toJSON() as DocIndexJobData);
  }

  async findUnfinishedJobs(botId: string): Promise<DocIndexJobData[]> {
    const id = new Types.ObjectId(botId);
    const docIndexJobs = await this.docIndexJobModel
      .find({
        bot: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
      })
      .exec();
    return docIndexJobs.map((crawlJob) => crawlJob.toJSON() as DocIndexJobData);
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
    const now = new Date();
    const docIndexJob = await this.docIndexJobModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: now } },
      {
        new: true,
      },
    );
    return docIndexJob.toJSON() as DocIndexJobData;
  }

  async incrementIndexed(docIndexJobId: string) {
    const id = new Types.ObjectId(docIndexJobId);
    const now = new Date();
    const docIndexJob = await this.docIndexJobModel.findByIdAndUpdate(
      id,
      { $inc: { indexed: 1 }, $set: { updatedAt: now } },
      { new: true },
    );
    return docIndexJob.toJSON() as DocIndexJobData;
  }
}
