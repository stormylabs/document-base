import { ExtractFileJobData } from '@/shared/interfaces/extractFileJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExtractFileJob } from '../schemas/extractFileJob.schema';
import { JobStatus } from '@/shared/interfaces';
import { JOB_TIMEOUT } from '@/shared/constants';

@Injectable()
export class ExtractFileJobRepository {
  constructor(
    @InjectModel(ExtractFileJob.name)
    private readonly extractFileJobModel: Model<ExtractFileJob>,
  ) {}

  async create({
    botId,
    organizationId,
    ...extractFileJobData
  }: {
    botId?: string;
    organizationId?: string;
    initUrls: string[];
  }): Promise<ExtractFileJobData> {
    const payload: any = {};
    if (botId) {
      payload.bot = new Types.ObjectId(botId);
    }
    if (organizationId) {
      payload.organization = new Types.ObjectId(organizationId);
    }

    const extractFileJob = new this.extractFileJobModel({
      ...extractFileJobData,
      bot: botId,
    });
    const created = await extractFileJob.save();
    return created.toJSON() as ExtractFileJobData;
  }

  async findById(extractFileJobId: string): Promise<ExtractFileJobData | null> {
    const extractFileJob = await this.extractFileJobModel
      .findById(extractFileJobId)
      .exec();
    if (!extractFileJob) return null;
    return extractFileJob.toJSON() as ExtractFileJobData;
  }

  async exists(extractFileJobIds: string[]): Promise<boolean> {
    const extractFileJobs = await this.extractFileJobModel
      .find({ _id: { $in: extractFileJobIds } })
      .exec();
    return extractFileJobs.length === extractFileJobIds.length;
  }

  async findAll(): Promise<ExtractFileJobData[]> {
    const extractFileJobs = await this.extractFileJobModel.find().exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async findAllByBotId(botId: string): Promise<ExtractFileJobData[]> {
    const id = new Types.ObjectId(botId);
    const extractFileJobs = await this.extractFileJobModel
      .find({ bot: id })
      .exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async findByOrgId(orgId: string): Promise<ExtractFileJobData[]> {
    const id = new Types.ObjectId(orgId);
    const extractFileJobs = await this.extractFileJobModel
      .find({ organization: id })
      .exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<ExtractFileJobData[]> {
    const timeout = Date.now() - JOB_TIMEOUT;
    const extractFileJobs = await this.extractFileJobModel
      .find({
        status,
        updatedAt: {
          $lt: new Date(timeout),
        },
      })
      .exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async findUnfinishedJobs(botId: string): Promise<ExtractFileJobData[]> {
    const id = new Types.ObjectId(botId);
    const extractFileJobs = await this.extractFileJobModel
      .find({
        bot: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
      })
      .exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async findUnfinishedJobsByOrgId(
    orgId: string,
  ): Promise<ExtractFileJobData[]> {
    const id = new Types.ObjectId(orgId);
    const extractFileJobs = await this.extractFileJobModel
      .find({
        organization: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
      })
      .exec();
    return extractFileJobs.map(
      (extractFileJob) => extractFileJob.toJSON() as ExtractFileJobData,
    );
  }

  async delete(extractFileJobId: string): Promise<ExtractFileJobData> {
    const id = new Types.ObjectId(extractFileJobId);
    const extractFileJob = await this.extractFileJobModel
      .findByIdAndDelete(id)
      .exec();
    return extractFileJob.toJSON() as ExtractFileJobData;
  }

  async update(
    extractFileJobId: string,
    data: Partial<{ status: JobStatus; locked: boolean; deletedAt: Date }>,
  ): Promise<ExtractFileJobData | null> {
    const id = new Types.ObjectId(extractFileJobId);
    const now = new Date();
    const extractFileJob = await this.extractFileJobModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: now } },
      {
        new: true,
      },
    );
    return extractFileJob.toJSON() as ExtractFileJobData;
  }

  async bulkUpdate(
    jobIds: string[],
    data: Partial<{ status: JobStatus; locked: boolean }>,
  ): Promise<ExtractFileJobData[] | null> {
    const ids = jobIds.map((id) => new Types.ObjectId(id));
    const now = new Date();

    const bulkUpdateJobs = ids.map((jobId) => ({
      updateOne: {
        filter: { _id: jobId },
        update: {
          ...data,
          updatedAt: now,
        },
        upsert: false,
      },
    }));

    await this.extractFileJobModel.bulkWrite(bulkUpdateJobs);

    const updatedExtractFileJob = await this.extractFileJobModel
      .find({ _id: { $in: ids } })
      .exec();

    return updatedExtractFileJob.map(
      (extractFile) => extractFile.toJSON() as ExtractFileJobData,
    );
  }

  async acquireLock(extractFileJobId: string) {
    const id = new Types.ObjectId(extractFileJobId);
    const extractFileJob = await this.extractFileJobModel.findOneAndUpdate(
      { _id: id, locked: false },
      { $set: { locked: true } },
      { new: true },
    );
    if (!extractFileJob) return false;
    return true;
  }

  async releaseLock(extractFileJobId: string) {
    const id = new Types.ObjectId(extractFileJobId);
    const extractFileJob = await this.extractFileJobModel.findOneAndUpdate(
      { _id: id, locked: true },
      { $set: { locked: false } },
      { new: true },
    );
    if (!extractFileJob) return false;
    return true;
  }

  async upsertDocuments(extractFileJobId: string, documentIds: string[]) {
    const docObjectIds = documentIds.map((id) => new Types.ObjectId(id));
    const id = new Types.ObjectId(extractFileJobId);
    const now = new Date();
    const extractFileJob = await this.extractFileJobModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { documents: { $each: docObjectIds } },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return extractFileJob.toJSON() as ExtractFileJobData;
  }

  async removeDocument(extractFileJobId: string, documentId: string) {
    const extractFileObjId = new Types.ObjectId(extractFileJobId);
    const docObjId = new Types.ObjectId(documentId);
    const now = new Date();
    const extractFileJob = await this.extractFileJobModel.findByIdAndUpdate(
      extractFileObjId,
      {
        $pull: { documents: docObjId },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return extractFileJob.toJSON() as ExtractFileJobData;
  }
}
