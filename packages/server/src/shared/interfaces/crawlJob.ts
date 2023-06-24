export interface CrawlJobData {
  _id: string;
  limit: number;
  status: CrawlJobStatus;
  initUrls: string[];
  createdAt: Date;
  deletedAt: Date;
}

export enum CrawlJobStatus {
  Pending = 'Pending',
  Running = 'Running',
  Finished = 'Finished',
  Failed = 'Failed',
}
