import { CrawlJobData } from '@/shared/interfaces/crawlJob';
import { Injectable } from '@nestjs/common';
import { CrawlJobRepository } from '../repositories/crawlJob.repository';
import { JobStatus } from '@/shared/interfaces';

@Injectable()
export class CrawlJobService {
  constructor(private crawlJobRepository: CrawlJobRepository) {}

  async create(data: {
    botId: string;
    limit: number;
    initUrls: string[];
    only: boolean;
  }): Promise<CrawlJobData> {
    const createdCrawlJob = await this.crawlJobRepository.create(data);
    return createdCrawlJob;
  }

  async findById(crawlJobId: string): Promise<CrawlJobData | null> {
    const crawlJob = await this.crawlJobRepository.findById(crawlJobId);
    return crawlJob;
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<CrawlJobData[]> {
    const timeoutJobs = await this.crawlJobRepository.findTimeoutJobs(status);
    return timeoutJobs;
  }

  async findUnfinishedJobs(botId: string): Promise<CrawlJobData[]> {
    const unfinishedJobs = await this.crawlJobRepository.findUnfinishedJobs(
      botId,
    );
    return unfinishedJobs;
  }

  async findAllByBotId(botId: string): Promise<CrawlJobData[]> {
    const docIndexJob = await this.crawlJobRepository.findAllByBotId(botId);
    return docIndexJob;
  }

  async updateStatus(
    crawlJobId: string,
    status: JobStatus,
  ): Promise<CrawlJobData> {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedBot = await this.crawlJobRepository.update(crawlJobId, {
      status,
    });
    return updatedBot;
  }

  async delete(crawlJobId: string): Promise<CrawlJobData> {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedCrawlJob = await this.crawlJobRepository.update(crawlJobId, {
      deletedAt: new Date(),
    });
    return updatedCrawlJob;
  }

  async exists(crawlJobIds: string[]): Promise<boolean> {
    return this.crawlJobRepository.exists(crawlJobIds);
  }

  async incrementLimit(crawlJobId: string) {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobRepository.incrementLimit(crawlJobId);
  }

  async upsertDocuments(crawlJobId: string, documentIds: string[]) {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobRepository.upsertDocuments(crawlJobId, documentIds);
  }

  async removeDocument(crawlJobId: string, documentId: string) {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobRepository.removeDocument(crawlJobId, documentId);
  }
}
