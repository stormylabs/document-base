import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  InvalidInputError,
  UnfinishedJobsError,
  ConflictError,
  AbortJobError,
  NotFoundError,
  LockedJobError,
} from '../core/AppError';

export const errorHandler = (
  error:
    | NotFoundError
    | InvalidInputError
    | UnfinishedJobsError
    | ConflictError
    | LockedJobError
    | AbortJobError,
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
      throw new ConflictException(error.errorValue().message);

    default:
      throw new InternalServerErrorException();
  }
};
