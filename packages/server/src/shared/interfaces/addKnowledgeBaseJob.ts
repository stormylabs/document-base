import { OrganizationData } from './organization';
import { KnowledgeBaseData } from './knowledgeBase';
import { CrawlJobData } from './crawlJob';
import { ExtractFileJobData } from './extractFileJob';

export interface AddKnowledgeBaseJobData {
  _id: string;
  organization: OrganizationData;
  knowledgeBase: KnowledgeBaseData;
  crawlJob: CrawlJobData;
  extractFileJob: ExtractFileJobData;
  createdAt: Date;
  deletedAt: Date;
}
