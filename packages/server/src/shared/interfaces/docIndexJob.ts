import { JobStatus } from '.';

export interface DocIndexJobData {
  _id: string;
  bot: string;
  status: JobStatus;
  indexed: number;
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
