import { UserData } from './user';
import { OrganizationData } from './organization';
import { AccessLevel } from './accessLevel';

export interface MemberData {
  _id: string;
  user: UserData;
  organization: OrganizationData;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
