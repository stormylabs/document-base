import { Injectable } from '@nestjs/common';
import { JobStatus } from '@/shared/interfaces';
import { DocIndexOrgJobData } from '@/shared/interfaces/docIndexOrgJob';
import { DocIndexOrgJobRepository } from '../repositories/docIndexJob.repository';

@Injectable()
export class DocIndexOrgJobService {
  constructor(private docIndexOrgJobRepository: DocIndexOrgJobRepository) {}

  async create(orgId: string): Promise<DocIndexOrgJobData> {
    const createdDocIndexJob = await this.docIndexOrgJobRepository.create({
      organization: orgId,
    });

    return createdDocIndexJob;
  }

  async findById(docIndexJobId: string): Promise<DocIndexOrgJobData | null> {
    const docIndexJob = await this.docIndexOrgJobRepository.findById(
      docIndexJobId,
    );
    return docIndexJob;
  }

  async findAllByOrgId(orgId: string): Promise<DocIndexOrgJobData[]> {
    const docIndexJob = await this.docIndexOrgJobRepository.findAllByOrgId(
      orgId,
    );
    return docIndexJob;
  }

  async findTimeoutJobs(
    status: JobStatus.Running | JobStatus.Pending,
  ): Promise<DocIndexOrgJobData[]> {
    const timeoutJobs = await this.docIndexOrgJobRepository.findTimeoutJobs(
      status,
    );
    return timeoutJobs;
  }

  async findUnfinishedJobs(orgId: string): Promise<DocIndexOrgJobData[]> {
    const unfinishedJobs =
      await this.docIndexOrgJobRepository.findUnfinishedJobs(orgId);
    return unfinishedJobs;
  }

  async updateStatus(
    docIndexJobId: string,
    status: JobStatus,
    locked?: boolean,
  ): Promise<DocIndexOrgJobData> {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex organization job does not exist.');
    const updatedBot = await this.docIndexOrgJobRepository.update(
      docIndexJobId,
      {
        status,
        locked,
      },
    );
    return updatedBot;
  }

  async bulkUpdateStatus(
    jobsIds: string[],
    status: JobStatus,
    locked: boolean,
  ): Promise<DocIndexOrgJobData[]> {
    const updatedDocIndexJobs = await this.docIndexOrgJobRepository.bulkUpdate(
      jobsIds,
      {
        status,
        locked,
      },
    );

    return updatedDocIndexJobs;
  }

  async delete(docIndexJobId: string): Promise<DocIndexOrgJobData> {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex organization job does not exist.');
    const updatedDocIndexJob = await this.docIndexOrgJobRepository.update(
      docIndexJobId,
      {
        deletedAt: new Date(),
      },
    );
    return updatedDocIndexJob;
  }

  async exists(docIndexJobIds: string[]): Promise<boolean> {
    return this.docIndexOrgJobRepository.exists(docIndexJobIds);
  }

  async acquireLock(docIndexJobId: string): Promise<boolean> {
    const exist = await this.exists([docIndexJobId]);
    if (!exist) throw new Error('DocIndex organization job does not exist.');
    return this.docIndexOrgJobRepository.acquireLock(docIndexJobId);
  }

  async releaseLock(docIndexJobId: string): Promise<boolean> {
    const exist = await this.exists([docIndexJobId]);
    if (!exist) throw new Error('DocIndex organization job does not exist.');
    return this.docIndexOrgJobRepository.releaseLock(docIndexJobId);
  }

  async upsertDocuments(docIndexJobId: string, documentIds: string[]) {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex organization job does not exist.');
    return this.docIndexOrgJobRepository.upsertDocuments(
      docIndexJobId,
      documentIds,
    );
  }

  async removeDocument(docIndexJobId: string, documentId: string) {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex organization job does not exist.');
    return this.docIndexOrgJobRepository.removeDocument(
      docIndexJobId,
      documentId,
    );
  }
}
