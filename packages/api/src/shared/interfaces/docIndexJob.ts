import { JobStatus } from '.';

export interface DocIndexJobData {
  _id: string;
  bot: string;
  status: JobStatus;
  documents: string[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface DocIndexJobMessage {
  botId: string;
  jobId: string;
  documentId: string;
}
