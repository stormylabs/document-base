import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  InvalidInputError,
  UnfinishedJobsError,
  ConflictError,
  AbortJobError,
  NotFoundError,
  LockedJobError,
  UnauthorizedError,
} from '../core/AppError';

export const errorHandler = (
  error:
    | NotFoundError
    | InvalidInputError
    | UnfinishedJobsError
    | ConflictError
    | LockedJobError
    | AbortJobError
    | UnauthorizedError,
) => {
  switch (error.constructor.name) {
    case 'NotFoundError':
      throw new NotFoundException(error.errorValue().message);

    case 'InvalidInputError':
      throw new BadRequestException(error.errorValue().message);

    case 'UnfinishedJobsError':
    case 'ConflictError':
    case 'AbortJobError':
    case 'LockedJobError':
    case 'UserExistsError':
      throw new ConflictException(error.errorValue().message);

    case 'UnauthorizedError':
      throw new UnauthorizedException(error.errorValue().message);

    default:
      throw new InternalServerErrorException();
  }
};
