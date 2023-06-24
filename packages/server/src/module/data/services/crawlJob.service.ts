import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { CrawlJobRepository } from '../repositories/crawlJob.repository';
import { CrawlJob } from '../schemas/crawlJob.schema';

@Injectable()
export class CrawlJobService {
  constructor(private crawlJobRepository: CrawlJobRepository) {}

  async create(limit: number, initUrls: string[]): Promise<CrawlJobData> {
    const crawlJobData: Partial<CrawlJob> = {
      limit,
      initUrls,
    };
    const createdCrawlJob = await this.crawlJobRepository.create(crawlJobData);
    return createdCrawlJob;
  }

  async delete(crawlJobId: string): Promise<CrawlJobData> {
    const updatedCrawlJob = await this.crawlJobRepository.softDelete(
      crawlJobId,
    );
    return updatedCrawlJob;
  }
}
