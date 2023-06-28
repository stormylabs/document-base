import { JobStatus } from '.';

export interface CrawlJobData {
  _id: string;
  botId: string;
  limit: number;
  status: JobStatus;
  initUrls: string[];
  createdAt: Date;
  deletedAt: Date;
}

export interface CrawlJobMessage {
  botId: string;
  jobId: string;
  url: string;
}
