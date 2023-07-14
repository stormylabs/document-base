import { DocumentData } from './document';

export interface BotData {
  _id: string;
  name: string;
  fallbackMessage: string;
  documents: DocumentData[];
  createdAt: Date;
  deletedAt: Date;
}
