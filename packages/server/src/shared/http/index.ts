import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Result } from '../core/Result';
import UseCaseError from '../core/UseCaseError';

export const errorHandler = (error: Result<UseCaseError>) => {
  switch (error.constructor.name) {
    case 'NotFoundError': {
      throw new NotFoundException(error.errorValue().message);
    }
    default:
      throw new InternalServerErrorException(error.errorValue().message);
  }
};
