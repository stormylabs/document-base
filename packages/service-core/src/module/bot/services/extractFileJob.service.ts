import { ExtractFileJobData } from '@/shared/interfaces/extractFileJob';
import { Injectable } from '@nestjs/common';
import { ExtractFileJobRepository } from '../repositories/extractFileJob.repository';
import { JobStatus } from '@/shared/interfaces';

@Injectable()
export class ExtractFileJobService {
  constructor(private extractFileJobRepository: ExtractFileJobRepository) {}

  async create(data: {
    botId?: string;
    knowledgeBaseId?: string;
    initUrls: string[];
  }): Promise<ExtractFileJobData> {
    const createdExtractFileJob = await this.extractFileJobRepository.create(
      data
    );
    return createdExtractFileJob;
  }

  async findById(extractFileJobId: string): Promise<ExtractFileJobData | null> {
    const extractFileJob = await this.extractFileJobRepository.findById(
      extractFileJobId
    );
    return extractFileJob;
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending
  ): Promise<ExtractFileJobData[]> {
    const timeoutJobs = await this.extractFileJobRepository.findTimeoutJobs(
      status
    );
    return timeoutJobs;
  }

  async findUnfinishedJobs(botId: string): Promise<ExtractFileJobData[]> {
    const unfinishedJobs =
      await this.extractFileJobRepository.findUnfinishedJobs(botId);
    return unfinishedJobs;
  }

  async findUnfinishedJobsByKnowledgeBaseId(
    knowledgeBaseId: string
  ): Promise<ExtractFileJobData[]> {
    const unfinishedJobs =
      await this.extractFileJobRepository.findUnfinishedJobsByKnowledgeBaseId(
        knowledgeBaseId
      );
    return unfinishedJobs;
  }

  async findAllByBotId(botId: string): Promise<ExtractFileJobData[]> {
    const extractFileJob = await this.extractFileJobRepository.findAllByBotId(
      botId
    );
    return extractFileJob;
  }

  async findByKnowledgeBaseId(
    knowledgeBaseId: string
  ): Promise<ExtractFileJobData[]> {
    const extractFileJob =
      await this.extractFileJobRepository.findByKnowledgeBaseId(
        knowledgeBaseId
      );
    return extractFileJob;
  }

  async updateStatus(
    extractFileJobId: string,
    status: JobStatus,
    locked?: boolean
  ): Promise<ExtractFileJobData> {
    const exists = await this.exists([extractFileJobId]);
    if (!exists) throw new Error('ExtractFile job does not exist.');
    const updatedBot = await this.extractFileJobRepository.update(
      extractFileJobId,
      {
        status,
        locked,
      }
    );
    return updatedBot;
  }

  async bulkUpdateStatus(
    jobsIds: string[],
    status: JobStatus,
    locked: boolean
  ): Promise<ExtractFileJobData[]> {
    const updatedExtractFileJobs =
      await this.extractFileJobRepository.bulkUpdate(jobsIds, {
        status,
        locked,
      });

    return updatedExtractFileJobs;
  }

  async delete(extractFileJobId: string): Promise<ExtractFileJobData> {
    const exists = await this.exists([extractFileJobId]);
    if (!exists) throw new Error('ExtractFile job does not exist.');
    const updatedExtractFileJob = await this.extractFileJobRepository.update(
      extractFileJobId,
      {
        deletedAt: new Date(),
      }
    );
    return updatedExtractFileJob;
  }

  async exists(extractFileJobIds: string[]): Promise<boolean> {
    return this.extractFileJobRepository.exists(extractFileJobIds);
  }

  async acquireLock(extractFileJobId: string): Promise<boolean> {
    const exist = await this.exists([extractFileJobId]);
    if (!exist) throw new Error('Crawl job does not exist.');
    return this.extractFileJobRepository.acquireLock(extractFileJobId);
  }

  async releaseLock(extractFileJobId: string): Promise<boolean> {
    const exist = await this.exists([extractFileJobId]);
    if (!exist) throw new Error('Crawl job does not exist.');
    return this.extractFileJobRepository.releaseLock(extractFileJobId);
  }

  async upsertDocuments(extractFileJobId: string, documentIds: string[]) {
    const exists = await this.exists([extractFileJobId]);
    if (!exists) throw new Error('ExtractFile job does not exist.');
    return this.extractFileJobRepository.upsertDocuments(
      extractFileJobId,
      documentIds
    );
  }

  async removeDocument(extractFileJobId: string, documentId: string) {
    const exists = await this.exists([extractFileJobId]);
    if (!exists) throw new Error('ExtractFile job does not exist.');
    return this.extractFileJobRepository.removeDocument(
      extractFileJobId,
      documentId
    );
  }
}
