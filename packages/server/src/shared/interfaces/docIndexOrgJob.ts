import { JobStatus } from '.';

export interface DocIndexOrgJobData {
  _id: string;
  organization: string;
  status: JobStatus;
  documents: string[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface DocIndexOrgJobMessage {
  organizationId: string;
  jobId: string;
  documentId: string;
}
