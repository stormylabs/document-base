import { Injectable } from '@nestjs/common';
import { JobStatus } from '@/shared/interfaces';
import { DocIndexJobData } from '@/shared/interfaces/docIndexJob';
import { DocIndexJobRepository } from '../repositories/docIndexJob.repository';

@Injectable()
export class DocIndexJobService {
  constructor(private docIndexJobRepository: DocIndexJobRepository) {}

  async create(botId: string): Promise<DocIndexJobData> {
    const createdDocIndexJob = await this.docIndexJobRepository.create({
      bot: botId,
    });
    return createdDocIndexJob;
  }

  async findById(docIndexJobId: string): Promise<DocIndexJobData | null> {
    const docIndexJob = await this.docIndexJobRepository.findById(
      docIndexJobId,
    );
    return docIndexJob;
  }

  async findAllByBotId(botId: string): Promise<DocIndexJobData[]> {
    const docIndexJob = await this.docIndexJobRepository.findAllByBotId(botId);
    return docIndexJob;
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<DocIndexJobData[]> {
    const timeoutJobs = await this.docIndexJobRepository.findTimeoutJobs(
      status,
    );
    return timeoutJobs;
  }

  async findUnfinishedJobs(botId: string): Promise<DocIndexJobData[]> {
    const unfinishedJobs = await this.docIndexJobRepository.findUnfinishedJobs(
      botId,
    );
    return unfinishedJobs;
  }

  async updateStatus(
    docIndexJobId: string,
    status: JobStatus,
    locked?: boolean,
  ): Promise<DocIndexJobData> {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    const updatedBot = await this.docIndexJobRepository.update(docIndexJobId, {
      status,
      locked,
    });
    return updatedBot;
  }

  async bulkUpdateStatus(
    jobsIds: string[],
    status: JobStatus,
    locked: boolean,
  ): Promise<DocIndexJobData[]> {
    const updatedDocIndexJobs = await this.docIndexJobRepository.bulkUpdate(
      jobsIds,
      {
        status,
        locked,
      },
    );

    return updatedDocIndexJobs;
  }

  async delete(docIndexJobId: string): Promise<DocIndexJobData> {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    const updatedDocIndexJob = await this.docIndexJobRepository.update(
      docIndexJobId,
      {
        deletedAt: new Date(),
      },
    );
    return updatedDocIndexJob;
  }

  async exists(docIndexJobIds: string[]): Promise<boolean> {
    return this.docIndexJobRepository.exists(docIndexJobIds);
  }

  async acquireLock(docIndexJobId: string): Promise<boolean> {
    const exist = await this.exists([docIndexJobId]);
    if (!exist) throw new Error('DocIndex job does not exist.');
    return this.docIndexJobRepository.acquireLock(docIndexJobId);
  }

  async releaseLock(docIndexJobId: string): Promise<boolean> {
    const exist = await this.exists([docIndexJobId]);
    if (!exist) throw new Error('DocIndex job does not exist.');
    return this.docIndexJobRepository.releaseLock(docIndexJobId);
  }

  async upsertDocuments(docIndexJobId: string, documentIds: string[]) {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    return this.docIndexJobRepository.upsertDocuments(
      docIndexJobId,
      documentIds,
    );
  }

  async removeDocument(docIndexJobId: string, documentId: string) {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    return this.docIndexJobRepository.removeDocument(docIndexJobId, documentId);
  }
}
