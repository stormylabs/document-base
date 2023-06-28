import { CrawlJobData, CrawlJobStatus } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { CrawlJobRepository } from '../repositories/crawlJob.repository';

@Injectable()
export class CrawlJobService {
  constructor(private crawlJobRepository: CrawlJobRepository) {}

  async create(
    data: Omit<CrawlJobData, '_id' | 'status' | 'createdAt' | 'deletedAt'>,
  ): Promise<CrawlJobData> {
    const createdCrawlJob = await this.crawlJobRepository.create(data);
    return createdCrawlJob;
  }

  async findById(crawlJobId: string): Promise<CrawlJobData | null> {
    const crawlJob = await this.crawlJobRepository.findById(crawlJobId);
    return crawlJob;
  }

  async updateStatus(
    crawlJobId: string,
    status: CrawlJobStatus,
  ): Promise<CrawlJobData> {
    const exists = await this.exists(crawlJobId);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedBot = await this.crawlJobRepository.update(crawlJobId, {
      status,
    });
    return updatedBot;
  }

  async delete(crawlJobId: string): Promise<CrawlJobData> {
    const exists = await this.exists(crawlJobId);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedCrawlJob = await this.crawlJobRepository.update(crawlJobId, {
      deletedAt: new Date(),
    });
    return updatedCrawlJob;
  }

  async exists(crawlJobId: string): Promise<boolean> {
    const crawlJob = await this.crawlJobRepository.findById(crawlJobId);
    return !!crawlJob;
  }

  async incrementLimit(crawlJobId: string) {
    const exists = await this.exists(crawlJobId);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobRepository.incrementLimit(crawlJobId);
  }
}
