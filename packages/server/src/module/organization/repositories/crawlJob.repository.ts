/* eslint-disable @typescript-eslint/no-unused-vars */
import { CrawlJobOrganizationData } from '@/shared/interfaces/crawlJobOrganization';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlJobOrganization } from '../schemas/crawlJob.schema';
import { JobStatus } from '@/shared/interfaces';
import { JOB_TIMEOUT } from '@/shared/constants';

@Injectable()
export class CrawlJobOrganizationRepository {
  constructor(
    @InjectModel(CrawlJobOrganization.name)
    private readonly crawlJobOrgModel: Model<CrawlJobOrganization>,
  ) {}

  async create(crawlJobOrgData: {
    organizationId: string;
    initUrls: string[];
    limit: number;
  }): Promise<CrawlJobOrganizationData> {
    const orgId = new Types.ObjectId(crawlJobOrgData.organizationId);
    const crawlJobOrg = new this.crawlJobOrgModel({
      ...crawlJobOrgData,
      organizationId: orgId,
    });
    const created = await crawlJobOrg.save();
    return created.toJSON() as CrawlJobOrganizationData;
  }

  async findById(crawlJobId: string): Promise<CrawlJobOrganizationData | null> {
    const crawlJob = await this.crawlJobOrgModel.findById(crawlJobId).exec();
    if (!crawlJob) return null;
    return crawlJob.toJSON() as CrawlJobOrganizationData;
  }

  async exists(crawlJobIds: string[]): Promise<boolean> {
    const crawlJobs = await this.crawlJobOrgModel
      .find({ _id: { $in: crawlJobIds } })
      .exec();
    return crawlJobs.length === crawlJobIds.length;
  }

  async findAll(): Promise<CrawlJobOrganizationData[]> {
    const crawlJobs = await this.crawlJobOrgModel.find().exec();
    return crawlJobs.map(
      (crawlJob) => crawlJob.toJSON() as CrawlJobOrganizationData,
    );
  }

  async findJobsByOrgId(orgId: string): Promise<CrawlJobOrganizationData[]> {
    const id = new Types.ObjectId(orgId);
    const crawlJobs = await this.crawlJobOrgModel
      .find({ organization: id })
      .exec();
    return crawlJobs.map(
      (crawlJob) => crawlJob.toJSON() as CrawlJobOrganizationData,
    );
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<CrawlJobOrganizationData[]> {
    const timeout = Date.now() - JOB_TIMEOUT;
    const crawlJobs = await this.crawlJobOrgModel
      .find({
        status,
        updatedAt: {
          $lt: new Date(timeout),
        },
      })
      .exec();
    return crawlJobs.map(
      (crawlJob) => crawlJob.toJSON() as CrawlJobOrganizationData,
    );
  }

  async findUnfinishedJobs(orgId: string): Promise<CrawlJobOrganizationData[]> {
    const id = new Types.ObjectId(orgId);
    const crawlJobs = await this.crawlJobOrgModel
      .find({
        organization: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
      })
      .exec();
    return crawlJobs.map(
      (crawlJob) => crawlJob.toJSON() as CrawlJobOrganizationData,
    );
  }

  async delete(crawlJobId: string): Promise<CrawlJobOrganizationData> {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobOrgModel.findByIdAndDelete(id).exec();
    return crawlJob.toJSON() as CrawlJobOrganizationData;
  }

  async update(
    crawlJobId: string,
    data: Partial<{ status: JobStatus; locked: boolean; deletedAt: Date }>,
  ): Promise<CrawlJobOrganizationData | null> {
    const id = new Types.ObjectId(crawlJobId);
    const now = new Date();
    const crawlJob = await this.crawlJobOrgModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: now } },
      {
        new: true,
      },
    );
    return crawlJob.toJSON() as CrawlJobOrganizationData;
  }

  async bulkUpdate(
    jobIds: string[],
    data: Partial<{ status: JobStatus; locked: boolean }>,
  ): Promise<CrawlJobOrganizationData[] | null> {
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

    await this.crawlJobOrgModel.bulkWrite(bulkUpdateJobs);

    const updatedCrawlJob = await this.crawlJobOrgModel
      .find({ _id: { $in: ids } })
      .exec();

    return updatedCrawlJob.map(
      (crawlJob) => crawlJob.toJSON() as CrawlJobOrganizationData,
    );
  }

  async acquireLock(crawlJobId: string) {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobOrgModel.findOneAndUpdate(
      { _id: id, locked: false },
      { $set: { locked: true } },
      { new: true },
    );
    if (!crawlJob) return false;
    return true;
  }

  async releaseLock(crawlJobId: string) {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobOrgModel.findOneAndUpdate(
      { _id: id, locked: true },
      { $set: { locked: false } },
      { new: true },
    );
    if (!crawlJob) return false;
    return true;
  }

  async upsertDocuments(crawlJobId: string, documentIds: string[]) {
    const docObjectIds = documentIds.map((id) => new Types.ObjectId(id));
    const id = new Types.ObjectId(crawlJobId);
    const now = new Date();
    const crawlJob = await this.crawlJobOrgModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { documents: { $each: docObjectIds } },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return crawlJob.toJSON() as CrawlJobOrganizationData;
  }

  async removeDocument(crawlJobId: string, documentId: string) {
    const crawlObjId = new Types.ObjectId(crawlJobId);
    const docObjId = new Types.ObjectId(documentId);
    const now = new Date();
    const crawlJob = await this.crawlJobOrgModel.findByIdAndUpdate(
      crawlObjId,
      {
        $pull: { documents: docObjId },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return crawlJob.toJSON() as CrawlJobOrganizationData;
  }
}
