export enum Languages {
  'zh' = 'zh',
  'en' = 'en',
}

export type JobType = 'web-crawl' | 'doc-index' | 'file-extract';

export enum JobStatus {
  Pending = 'pending',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}
