import { MemberData } from './member';
import { UserData } from './user';

export interface RequestWithUser extends Request {
  user: UserData & {
    member?: MemberData;
  };
}
