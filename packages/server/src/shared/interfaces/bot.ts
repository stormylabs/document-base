import { DocumentData } from './document';
import { UserData } from './user';

export interface BotData {
  _id: string;
  name: string;
  fallbackMessage: string;
  prompt: string;
  documents: DocumentData[];
  user: UserData;
  createdAt: Date;
  deletedAt: Date;
}
