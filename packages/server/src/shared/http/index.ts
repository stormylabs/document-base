import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Result } from '../core/Result';
import UseCaseError from '../core/UseCaseError';

export const errorHandler = (error: Result<UseCaseError>) => {
  switch (error.constructor.name) {
    case 'NotFoundError':
    case 'BotNotFoundError':
    case 'CrawlJobNotFoundError':
    case 'DocumentNotFoundError':
    case 'DocIndexJobNotFoundError':
    case 'ExtractFileJobNotFoundError':
      throw new NotFoundException(error.errorValue().message);

    case 'InvalidInputError':
      throw new BadRequestException(error.errorValue().message);

    case 'UnfinishedCrawlJobsError':
    case 'UnfinishedDocIndexJobsError':
    case 'ConflictError':
    case 'InvalidAbortJobError':
      throw new ConflictException(error.errorValue().message);

    default:
      throw new InternalServerErrorException();
  }
};
