import { UserData } from './user';

export enum Languages {
  'zh' = 'zh',
  'en' = 'en',
}

export enum JobType {
  WebCrawl = 'web-crawl',
  DocIndex = 'doc-index',
  FileExtract = 'file-extract',
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
  KnowledgeBase = 'KnowledgeBase',
  AddKnowledgeBaseJob = 'AddKnowledgeBaseJob',
}

export enum JobStatus {
  Pending = 'pending',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
  Aborted = 'aborted',
}

export enum KnowledgeBaseType {
  ProductSearch = 'ProductSearch',
  FAQ = 'FAQ',
}

export interface AuthRequest extends Request {
  user: UserData;
}
