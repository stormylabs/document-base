import { CrawlJobOrganizationData } from '@/shared/interfaces/crawlJobOrganization';
import { Injectable } from '@nestjs/common';
import { CrawlJobOrganizationRepository } from '../repositories/crawlJob.repository';
import { JobStatus } from '@/shared/interfaces';

@Injectable()
export class CrawlJobOrganizationService {
  constructor(private crawlJobOrgRepository: CrawlJobOrganizationRepository) {}

  async create(data: {
    organizationId: string;
    limit: number;
    initUrls: string[];
  }): Promise<CrawlJobOrganizationData> {
    const createdCrawlJob = await this.crawlJobOrgRepository.create(data);

    return createdCrawlJob;
  }

  async findById(crawlJobId: string): Promise<CrawlJobOrganizationData | null> {
    const crawlJob = await this.crawlJobOrgRepository.findById(crawlJobId);
    return crawlJob;
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<CrawlJobOrganizationData[]> {
    const timeoutJobs = await this.crawlJobOrgRepository.findTimeoutJobs(
      status,
    );
    return timeoutJobs;
  }

  async findUnfinishedJobs(orgId: string): Promise<CrawlJobOrganizationData[]> {
    const unfinishedJobs = await this.crawlJobOrgRepository.findUnfinishedJobs(
      orgId,
    );
    return unfinishedJobs;
  }

  async findJobsByBotId(orgId: string): Promise<CrawlJobOrganizationData[]> {
    const crawlJob = await this.crawlJobOrgRepository.findJobsByOrgId(orgId);
    return crawlJob;
  }

  async updateStatus(
    crawlJobId: string,
    status: JobStatus,
    locked?: boolean,
  ): Promise<CrawlJobOrganizationData> {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedBot = await this.crawlJobOrgRepository.update(crawlJobId, {
      status,
      locked,
    });
    return updatedBot;
  }

  async bulkUpdateStatus(
    crawlJobsIds: string[],
    status: JobStatus,
    locked: boolean,
  ): Promise<CrawlJobOrganizationData[]> {
    const updatedCrawlJobs = await this.crawlJobOrgRepository.bulkUpdate(
      crawlJobsIds,
      {
        status,
        locked,
      },
    );

    return updatedCrawlJobs;
  }

  async delete(crawlJobId: string): Promise<CrawlJobOrganizationData> {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    const updatedCrawlJob = await this.crawlJobOrgRepository.update(
      crawlJobId,
      {
        deletedAt: new Date(),
      },
    );
    return updatedCrawlJob;
  }

  async exists(crawlJobIds: string[]): Promise<boolean> {
    return this.crawlJobOrgRepository.exists(crawlJobIds);
  }

  async acquireLock(crawlJobId: string): Promise<boolean> {
    const exist = await this.exists([crawlJobId]);
    if (!exist) throw new Error('Crawl job does not exist.');
    return this.crawlJobOrgRepository.acquireLock(crawlJobId);
  }

  async releaseLock(crawlJobId: string): Promise<boolean> {
    const exist = await this.exists([crawlJobId]);
    if (!exist) throw new Error('Crawl job does not exist.');
    return this.crawlJobOrgRepository.releaseLock(crawlJobId);
  }

  async upsertDocuments(crawlJobId: string, documentIds: string[]) {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobOrgRepository.upsertDocuments(crawlJobId, documentIds);
  }

  async removeDocument(crawlJobId: string, documentId: string) {
    const exists = await this.exists([crawlJobId]);
    if (!exists) throw new Error('Crawl job does not exist.');
    return this.crawlJobOrgRepository.removeDocument(crawlJobId, documentId);
  }
}
