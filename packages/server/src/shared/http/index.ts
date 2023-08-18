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
    case 'BotNotFoundError':
    case 'CrawlJobNotFoundError':
    case 'DocumentNotFoundError':
    case 'DocIndexJobNotFoundError':
    case 'ExtractFileJobNotFoundError':
    case 'UserNotFoundError':
      throw new NotFoundException(error.errorValue().message);

    case 'InvalidInputError':
      throw new BadRequestException(error.errorValue().message);

    case 'UnfinishedCrawlJobsError':
    case 'UnfinishedDocIndexJobsError':
    case 'UnfinishedExtractFileJobsError':
    case 'EmailUserAlreadyExistsError':
    case 'ConflictError':
    case 'AbortJobError':
    case 'LockedJobError':
      throw new ConflictException(error.errorValue().message);

    default:
      throw new InternalServerErrorException();
  }
};
