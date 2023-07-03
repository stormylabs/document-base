import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Result } from '../core/Result';
import UseCaseError from '../core/UseCaseError';

export const errorHandler = (error: Result<UseCaseError>) => {
  switch (error.constructor.name) {
    case 'NotFoundError':
      throw new NotFoundException(error.errorValue().message);

    case 'UnfinishedJobsError':
    case 'ConflictError':
      throw new ConflictException(error.errorValue().message);

    default:
      throw new InternalServerErrorException();
  }
};
