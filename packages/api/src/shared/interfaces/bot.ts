import { DocumentData } from './document';

export interface BotData {
  _id: string;
  name: string;
  documents: DocumentData[];
  createdAt: Date;
  deletedAt: Date;
}
