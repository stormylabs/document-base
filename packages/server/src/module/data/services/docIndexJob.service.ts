import { Injectable } from '@nestjs/common';
import { JobStatus } from '@/shared/interfaces';
import { DocIndexJobData } from '@/shared/interfaces/docIndexJob';
import { DocIndexJobRepository } from '../repositories/docIndexJob.repository';

@Injectable()
export class DocIndexJobService {
  constructor(private docIndexJobRepository: DocIndexJobRepository) {}

  async create(botId: string): Promise<DocIndexJobData> {
    const createdDocIndexJob = await this.docIndexJobRepository.create({
      botId,
    });
    return createdDocIndexJob;
  }

  async findById(docIndexJobId: string): Promise<DocIndexJobData | null> {
    const docIndexJob = await this.docIndexJobRepository.findById(
      docIndexJobId,
    );
    return docIndexJob;
  }

  async updateStatus(
    docIndexJobId: string,
    status: JobStatus,
  ): Promise<DocIndexJobData> {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    const updatedBot = await this.docIndexJobRepository.update(docIndexJobId, {
      status,
    });
    return updatedBot;
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

  async incrementIndexedCount(docIndexJobId: string) {
    const exists = await this.exists([docIndexJobId]);
    if (!exists) throw new Error('DocIndex job does not exist.');
    return this.docIndexJobRepository.incrementIndexedCount(docIndexJobId);
  }
}
