import { Logger } from '@nestjs/common';
import { Result } from './Result';
import UseCaseError from './UseCaseError';

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

export class UnfinishedCrawlJobsError extends Result<UseCaseError> {
  public constructor(jobIds: string[]) {
    const message = `There are unfinished crawl jobs. Please wait until they are finished: ${jobIds.join(
      ', ',
    )}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, UnfinishedCrawlJobsError.name);
  }
}

export class UnfinishedDocIndexJobsError extends Result<UseCaseError> {
  public constructor(jobIds: string[]) {
    const message = `There are unfinished train jobs. Please wait until they are finished: ${jobIds.join(
      ', ',
    )}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, UnfinishedDocIndexJobsError.name);
  }
}

export class UnfinishedExtractFileJobsError extends Result<UseCaseError> {
  public constructor(jobIds: string[]) {
    const message = `There are unfinished extract file jobs. Please wait until they are finished: ${jobIds.join(
      ', ',
    )}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, UnfinishedExtractFileJobsError.name);
  }
}

export class LockedDocIndexJobError extends Result<UseCaseError> {
  public constructor(jobId: string) {
    const message = `Doc Index job is locked: ${jobId}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, LockedDocIndexJobError.name);
  }
}

export class LockedCrawlJobError extends Result<UseCaseError> {
  public constructor(jobId: string) {
    const message = `Crawl job is locked: ${jobId}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, LockedCrawlJobError.name);
  }
}

export class LockedExtractFileJobError extends Result<UseCaseError> {
  public constructor(jobId: string) {
    const message = `Extract File job is locked: ${jobId}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, LockedExtractFileJobError.name);
  }
}

export class NotFoundError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, NotFoundError.name);
  }
}

export class BotNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'Bot not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, BotNotFoundError.name);
  }
}

export class DocumentNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'Document not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, DocumentNotFoundError.name);
  }
}

export class CrawlJobNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'Crawl Job not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, CrawlJobNotFoundError.name);
  }
}

export class DocIndexJobNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'Train Job not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, DocIndexJobNotFoundError.name);
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

export class ExtractFileJobNotFoundError extends Result<UseCaseError> {
  public constructor() {
    const message = 'Extract File Job not found';
    super(false, { message } as UseCaseError);
    Logger.log(message, ExtractFileJobNotFoundError.name);
  }
}

export class S3UploadError extends Result<UseCaseError> {
  public constructor(filenames: string[]) {
    const message = `S3 upload failed: ${filenames.join(', ')}}`;
    super(false, { message } as UseCaseError);
    Logger.log(message, S3UploadError.name);
  }
}
