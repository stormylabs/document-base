import { JobStatus } from '.';

export interface CrawlJobData {
  _id: string;
  bot: string;
  limit: number;
  locked: boolean;
  documents: string[];
  status: JobStatus;
  initUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface CrawlJobMessage {
  botId: string;
  jobId: string;
  documentId: string;
}
