import { UserData } from './user';

export interface ApiKeyData {
  _id: string;
  apiKey: string;
  user: UserData;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
