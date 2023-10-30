import { JobStatus } from '@/shared/interfaces';

export interface ExtractFileJobData {
  _id: string;
  bot?: string;
  knowledgeBase?: string;
  documents: string[];
  status: JobStatus;
  initUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface ExtractFileJobMessage {
  botId?: string;
  knowledgeBaseId?: string;
  jobId: string;
  documentId: string;
}
