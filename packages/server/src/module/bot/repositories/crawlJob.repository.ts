/* eslint-disable @typescript-eslint/no-unused-vars */
import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlJob } from '../schemas/crawlJob.schema';
import { JobStatus } from '@/shared/interfaces';
import { JOB_TIMEOUT } from '@/shared/constants';

@Injectable()
export class CrawlJobRepository {
  constructor(
    @InjectModel(CrawlJob.name) private readonly crawlJobModel: Model<CrawlJob>,
  ) {}

  async create(crawlJobData: {
    botId: string;
    limit: number;
    initUrls: string[];
  }): Promise<CrawlJobData> {
    const botId = new Types.ObjectId(crawlJobData.botId);
    const crawlJob = new this.crawlJobModel({ ...crawlJobData, bot: botId });
    const created = await crawlJob.save();
    return created.toJSON() as CrawlJobData;
  }

  async findById(crawlJobId: string): Promise<CrawlJobData | null> {
    const crawlJob = await this.crawlJobModel.findById(crawlJobId).exec();
    if (!crawlJob) return null;
    return crawlJob.toJSON() as CrawlJobData;
  }

  async exists(crawlJobIds: string[]): Promise<boolean> {
    const crawlJobs = await this.crawlJobModel
      .find({ _id: { $in: crawlJobIds } })
      .exec();
    return crawlJobs.length === crawlJobIds.length;
  }

  async findAll(): Promise<CrawlJobData[]> {
    const crawlJobs = await this.crawlJobModel.find().exec();
    return crawlJobs.map((crawlJob) => crawlJob.toJSON() as CrawlJobData);
  }

  async findAllByBotId(botId: string): Promise<CrawlJobData[]> {
    const id = new Types.ObjectId(botId);
    const crawlJobs = await this.crawlJobModel.find({ bot: id }).exec();
    return crawlJobs.map((crawlJob) => crawlJob.toJSON() as CrawlJobData);
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<CrawlJobData[]> {
    const timeout = Date.now() - JOB_TIMEOUT;
    const crawlJobs = await this.crawlJobModel
      .find({
        status,
        updatedAt: {
          $lt: new Date(timeout),
        },
        locked: false,
      })
      .exec();
    return crawlJobs.map((crawlJob) => crawlJob.toJSON() as CrawlJobData);
  }

  async findUnfinishedJobs(botId: string): Promise<CrawlJobData[]> {
    const id = new Types.ObjectId(botId);
    const crawlJobs = await this.crawlJobModel
      .find({
        bot: id,
        status: { $in: [JobStatus.Pending, JobStatus.Running] },
        locked: false,
      })
      .exec();
    return crawlJobs.map((crawlJob) => crawlJob.toJSON() as CrawlJobData);
  }

  async delete(crawlJobId: string): Promise<CrawlJobData> {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobModel.findByIdAndDelete(id).exec();
    return crawlJob.toJSON() as CrawlJobData;
  }

  async update(
    crawlJobId: string,
    data: Partial<{ status: JobStatus; deletedAt: Date }>,
  ): Promise<CrawlJobData | null> {
    const id = new Types.ObjectId(crawlJobId);
    const now = new Date();
    const crawlJob = await this.crawlJobModel.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedAt: now } },
      {
        new: true,
      },
    );
    return crawlJob.toJSON() as CrawlJobData;
  }

  async acquireLock(crawlJobId: string) {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobModel.findOneAndUpdate(
      { _id: id, locked: false },
      { $set: { locked: true } },
      { new: true },
    );
    if (!crawlJob) return false;
    return true;
  }

  async releaseLock(crawlJobId: string) {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobModel.findOneAndUpdate(
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
    const crawlJob = await this.crawlJobModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { documents: { $each: docObjectIds } },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return crawlJob.toJSON() as CrawlJobData;
  }

  async removeDocument(crawlJobId: string, documentId: string) {
    const crawlObjId = new Types.ObjectId(crawlJobId);
    const docObjId = new Types.ObjectId(documentId);
    const now = new Date();
    const crawlJob = await this.crawlJobModel.findByIdAndUpdate(
      crawlObjId,
      {
        $pull: { documents: docObjId },
        $set: { updatedAt: now },
      },

      { new: true },
    );
    return crawlJob.toJSON() as CrawlJobData;
  }
}
