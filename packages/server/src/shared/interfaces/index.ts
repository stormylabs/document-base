import { UserData } from './user';

export enum Languages {
  'zh' = 'zh',
  'en' = 'en',
}

export enum JobType {
  WebCrawl = 'web-crawl',
  WebCrawlOrg = 'web-crawl-org',
  DocIndex = 'doc-index',
  DocIndexOrg = 'doc-index-org',
  FileExtract = 'file-extract',
}

export enum Resource {
  Bot = 'Bot',
  Document = 'Document',
  CrawlJob = 'Crawl job',
  CrawlJobOrg = 'Crawl job organization',
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
