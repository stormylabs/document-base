import { JobStatus } from '.';

export interface CrawlJobData {
  _id: string;
  bot?: string;
  knowledgeBase?: string;
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
  knowledgeBaseId?: string;
  jobId: string;
  documentId: string;
}
