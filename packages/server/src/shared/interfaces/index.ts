import { UserData } from './user';

export enum Languages {
  'zh' = 'zh',
  'en' = 'en',
}

export enum JobType {
  WebCrawl = 'web-crawl',
  DocIndex = 'doc-index',
  FileExtract = 'file-extract',
  Agent = 'agent',
}

export enum Resource {
  Bot = 'Bot',
  Document = 'Document',
  CrawlJob = 'Crawl job',
  DocIndexJob = 'Train job',
  ExtractFileJob = 'Extract file job',
  User = 'User',
  ApiKey = 'ApiKey',
  Organization = 'Organization',
  Engagement = 'Engagement',
}

export enum JobStatus {
  Pending = 'pending',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
  Aborted = 'aborted',
}

export interface AuthRequest extends Request {
  user: UserData;
}
