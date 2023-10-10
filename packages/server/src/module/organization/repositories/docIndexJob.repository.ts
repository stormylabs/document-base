/* eslint-disable @typescript-eslint/no-unused-vars */
import { DocIndexOrgJobData } from '@/shared/interfaces/docIndexOrgJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocIndexOrgJob } from '../schemas/docIndexJob.schema';
import { JobStatus } from '@/shared/interfaces';
import { JOB_TIMEOUT } from '@/shared/constants';

@Injectable()
export class DocIndexOrgJobRepository {
  constructor(
    @InjectModel(DocIndexOrgJob.name)
    private readonly docIndexOrgJobModel: Model<DocIndexOrgJob>,
  ) {}

  async create(
    docIndexJobData: Partial<DocIndexOrgJobData>,
  ): Promise<DocIndexOrgJobData> {
    const orgId = new Types.ObjectId(docIndexJobData.organization);
    const docIndexJob = new this.docIndexOrgJobModel({
      ...docIndexJobData,
      organization: orgId,
    });
    const created = await docIndexJob.save();
    return created.toJSON() as DocIndexOrgJobData;
  }

  async findById(docIndexOrgJobId: string): Promise<DocIndexOrgJobData | null> {
    const docIndexJob = await this.docIndexOrgJobModel
      .findById(docIndexOrgJobId)
      .exec();
    if (!docIndexJob) return null;
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }

  async findAllByOrgId(orgId: string): Promise<DocIndexOrgJobData[]> {
    const id = new Types.ObjectId(orgId);
    const docIndexJobs = await this.docIndexOrgJobModel
      .find({ organization: id })
      .exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexOrgJobData,
    );
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<DocIndexOrgJobData[]> {
    const timeout = Date.now() - JOB_TIMEOUT;
    const docIndexJobs = await this.docIndexOrgJobModel
      .find({
        status,
        updatedAt: {
          $lt: new Date(timeout),
        },
      })
      .exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexOrgJobData,
    );
  }

  async findUnfinishedJobs(orgId: string): Promise<DocIndexOrgJobData[]> {
    const id = new Types.ObjectId(orgId);
    const docIndexJobs = await this.docIndexOrgJobModel
      .find({
        organization: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
      })
      .exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexOrgJobData,
    );
  }

  async exists(docIndexOrgJobIds: string[]): Promise<boolean> {
    const docIndexJobs = await this.docIndexOrgJobModel
      .find({ _id: { $in: docIndexOrgJobIds } })
      .exec();
    return docIndexJobs.length === docIndexOrgJobIds.length;
  }

  async findAll(): Promise<DocIndexOrgJobData[]> {
    const docIndexJobs = await this.docIndexOrgJobModel.find().exec();
    return docIndexJobs.map(
      (docIndexJob) => docIndexJob.toJSON() as DocIndexOrgJobData,
    );
  }

  async delete(docIndexOrgJobId: string): Promise<DocIndexOrgJobData> {
    const id = new Types.ObjectId(docIndexOrgJobId);
    const docIndexJob = await this.docIndexOrgJobModel
      .findByIdAndDelete(id)
      .exec();
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }

  async update(
    docIndexOrgJobId: string,
    data: Partial<{ status: JobStatus; locked: boolean; deletedAt: Date }>,
  ): Promise<DocIndexOrgJobData | null> {
    const id = new Types.ObjectId(docIndexOrgJobId);
    const now = new Date();
    const docIndexJob = await this.docIndexOrgJobModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: now } },
      {
        new: true,
      },
    );
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }

  async bulkUpdate(
    docIndexOrgJobIds: string[],
    data: Partial<{ status: JobStatus; locked: boolean }>,
  ): Promise<DocIndexOrgJobData[] | null> {
    const ids = docIndexOrgJobIds.map((id) => new Types.ObjectId(id));
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

    await this.docIndexOrgJobModel.bulkWrite(bulkUpdateJobs);

    const updatedDocIndexOrgJobs = await this.docIndexOrgJobModel
      .find({ _id: { $in: ids } })
      .exec();

    return updatedDocIndexOrgJobs.map(
      (docIndexOrgJob) => docIndexOrgJob.toJSON() as DocIndexOrgJobData,
    );
  }

  async incrementIndexed(docIndexOrgJobId: string) {
    const id = new Types.ObjectId(docIndexOrgJobId);
    const now = new Date();
    const docIndexJob = await this.docIndexOrgJobModel.findByIdAndUpdate(
      id,
      { $inc: { indexed: 1 }, $set: { updatedAt: now } },
      { new: true },
    );
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }

  async acquireLock(docIndexOrgJobId: string) {
    const id = new Types.ObjectId(docIndexOrgJobId);
    const docIndexJob = await this.docIndexOrgJobModel.findOneAndUpdate(
      { _id: id, locked: false },
      { $set: { locked: true } },
      { new: true },
    );
    if (!docIndexJob) return false;
    return true;
  }

  async releaseLock(docIndexOrgJobId: string) {
    const id = new Types.ObjectId(docIndexOrgJobId);
    const docIndexJob = await this.docIndexOrgJobModel.findOneAndUpdate(
      { _id: id, locked: true },
      { $set: { locked: false } },
      { new: true },
    );
    if (!docIndexJob) return false;
    return true;
  }

  async upsertDocuments(docIndexOrgJobId: string, documentIds: string[]) {
    const docObjectIds = documentIds.map((id) => new Types.ObjectId(id));
    const id = new Types.ObjectId(docIndexOrgJobId);
    const now = new Date();
    const docIndexJob = await this.docIndexOrgJobModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { documents: { $each: docObjectIds } },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }

  async removeDocument(docIndexOrgJobId: string, documentId: string) {
    const docIndexObjId = new Types.ObjectId(docIndexOrgJobId);
    const docObjId = new Types.ObjectId(documentId);
    const now = new Date();
    const docIndexJob = await this.docIndexOrgJobModel.findByIdAndUpdate(
      docIndexObjId,
      {
        $pull: { documents: docObjId },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return docIndexJob.toJSON() as DocIndexOrgJobData;
  }
}
