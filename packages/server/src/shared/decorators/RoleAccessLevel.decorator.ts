import { SetMetadata } from '@nestjs/common';
import { AccessLevel } from '../interfaces/accessLevel';

export const RoleAccessLevel = (accessLevel: AccessLevel) =>
  SetMetadata('accessLevel', accessLevel);
