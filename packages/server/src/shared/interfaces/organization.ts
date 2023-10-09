import { DocumentData } from './document';
import { UserData } from './user';

export interface OrganizationData {
  _id: string;
  name: string;
  members: UserData[];
  documents: DocumentData[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
