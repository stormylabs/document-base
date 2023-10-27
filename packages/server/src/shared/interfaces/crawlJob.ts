import { JobStatus } from '.';

export interface CrawlJobData {
  _id: string;
  bot?: string;
  organization?: string;
  limit: number;
  locked: boolean;
  documents: string[];
  status: JobStatus;
  initUrls: string[];
  only: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface CrawlJobMessage {
  botId?: string;
  organizationId?: string;
  jobId: string;
  documentId: string;
}
