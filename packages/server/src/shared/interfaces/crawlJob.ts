export interface CrawlJobData {
  _id: string;
  botId: string;
  limit: number;
  status: CrawlJobStatus;
  initUrls: string[];
  createdAt: Date;
  deletedAt: Date;
}

export enum CrawlJobStatus {
  Pending = 'pending',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export interface CrawlJobMessage {
  url: string;
  botId: string;
  jobId: string;
}
