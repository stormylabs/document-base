/* eslint-disable @typescript-eslint/no-unused-vars */
import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlJob } from '../schemas/crawlJob.schema';
import { JobStatus } from '@/shared/interfaces';

@Injectable()
export class CrawlJobRepository {
  constructor(
    @InjectModel(CrawlJob.name) private readonly crawlJobModel: Model<CrawlJob>,
  ) {}

  async create(crawlJobData: Partial<CrawlJobData>): Promise<CrawlJobData> {
    const crawlJob = new this.crawlJobModel(crawlJobData);
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
    const crawlJob = await this.crawlJobModel.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
      },
    );
    return crawlJob.toJSON() as CrawlJobData;
  }

  async incrementLimit(crawlJobId: string) {
    const id = new Types.ObjectId(crawlJobId);
    const crawlJob = await this.crawlJobModel.findByIdAndUpdate(
      id,
      { $inc: { count: 1 } },
      { new: true },
    );
    return crawlJob.toJSON() as CrawlJobData;
  }
}
