import { DocumentData } from './document';

export interface BotData {
  _id: string;
  name: string;
  documents: DocumentData[];
  crawlJobId: string;
  createdAt: Date;
  deletedAt: Date;
}
