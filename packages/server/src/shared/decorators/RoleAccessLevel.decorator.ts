import { SetMetadata } from '@nestjs/common';
import { AccessLevel } from '../interfaces/accessLevel';

export const RoleAccessLevel = (accessLevels: AccessLevel[]) =>
  SetMetadata('accessLevels', accessLevels);
