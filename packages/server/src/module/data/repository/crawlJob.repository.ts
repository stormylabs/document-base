/* eslint-disable @typescript-eslint/no-unused-vars */
import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlJob } from '../schemas/crawlJob.schema';

@Injectable()
export class CrawlJobRepository {
  constructor(
    @InjectModel(CrawlJob.name) private readonly crawlJobModel: Model<CrawlJob>,
  ) {}

  async create(crawlJobData: Partial<CrawlJob>): Promise<CrawlJobData> {
    const crawlJob = new this.crawlJobModel(crawlJobData);
    const { __v, ...rest } = (await crawlJob.save()).toJSON();
    return rest as CrawlJobData;
  }

  async findById(crawlJobId: string): Promise<CrawlJob | null> {
    return await this.crawlJobModel.findById(crawlJobId).exec();
  }

  async findAll(): Promise<CrawlJob[]> {
    return await this.crawlJobModel.find().exec();
  }

  async delete(crawlJobId: string): Promise<CrawlJob | null> {
    return await this.crawlJobModel.findByIdAndDelete(crawlJobId).exec();
  }

  async softDelete(crawlJobId: string): Promise<CrawlJobData | null> {
    const crawlJob = await this.crawlJobModel.findById(crawlJobId).exec();
    if (!crawlJob) return null;
    crawlJob.deletedAt = new Date();
    const { __v, ...rest } = (await crawlJob.save()).toJSON();
    return rest as CrawlJobData;
  }
}
