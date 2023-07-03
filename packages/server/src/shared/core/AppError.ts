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
  private readonly logger = new Logger(InvalidInputError.name);
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
  public constructor() {
    const message =
      'There are unfinished jobs. Please wait until they are finished';
    super(false, { message } as UseCaseError);
    Logger.log(message, UnfinishedJobsError.name);
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
