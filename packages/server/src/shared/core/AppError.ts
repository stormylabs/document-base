import { Logger } from '@nestjs/common';
import { Result } from './Result';
import UseCaseError from './UseCaseError';
import { JobType, Resource } from '../interfaces';
import { JOB_TERM_MAPPING } from '../constants';

export default class UnexpectedError extends Result<UseCaseError> {
  public constructor(err: Error) {
    const message = err.message || `An unexpected error occurred.`;
    super(false, {
      name: err.name,
      message,
      error: err,
    } as UseCaseError);
  }

  public static create(err: Error): UnexpectedError {
    Logger.log(err.message, DomainModelCreationError.name);
    return new UnexpectedError(err);
  }
}

export class DomainModelCreationError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, DomainModelCreationError.name);
  }
}

export class ValueObjectCreationError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, ValueObjectCreationError.name);
  }
}

export class InvalidInputError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, InvalidInputError.name);
  }
}

export class ConflictError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, ConflictError.name);
  }
}

export class UnfinishedJobsError extends Result<UseCaseError> {
  public constructor(jobIds: string[], jobType: JobType) {
    const message = `${
      JOB_TERM_MAPPING[jobType]
    } unfinished. Please wait until they are finished: ${jobIds.join(', ')}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, UnfinishedJobsError.name);
  }
}

export class AbortJobError extends Result<UseCaseError> {
  public constructor(jobIds: string[], jobType: JobType) {
    const message = `${
      JOB_TERM_MAPPING[jobType]
    } are not in 'running' or 'pending' statuses: ${jobIds.join(', ')}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, AbortJobError.name);
  }
}

export class LockedJobError extends Result<UseCaseError> {
  public constructor(jobIds: string[], jobType: JobType) {
    const message = `${JOB_TERM_MAPPING[jobType]} locked: ${jobIds.join(', ')}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, LockedJobError.name);
  }
}

export class NotFoundError extends Result<UseCaseError> {
  public constructor(resource: Resource, ids: string[]) {
    const message = `${resource} not found: ${ids.join(', ')}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, NotFoundError.name);
  }
}

export class CrawlerError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, CrawlerError.name);
  }
}

export class SQSSendMessageError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, SQSSendMessageError.name);
  }
}

export class ExtractFileError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, ExtractFileError.name);
  }
}

export class S3UploadError extends Result<UseCaseError> {
  public constructor(filenames: string[]) {
    const message = `S3 upload failed: ${filenames.join(', ')}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, S3UploadError.name);
  }
}

export class UserExistsError extends Result<UseCaseError> {
  public constructor() {
    const message = `Email already exists.`;
    super(false, { message } as UseCaseError);
    Logger.log(message, UserExistsError.name);
  }
}

export class UserNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'User not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, UserNotFoundError.name);
  }
}
