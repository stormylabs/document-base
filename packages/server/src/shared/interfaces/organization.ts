import { UserData } from './user';

export interface OrganizationData {
  _id: string;
  name: string;
  members: UserData[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
