import { JobStatus } from '.';

export interface CrawlJobOrganizationData {
  _id: string;
  organization: string;
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

export interface CrawlJobOrgMessage {
  organizationId: string;
  jobId: string;
  documentId: string;
}
