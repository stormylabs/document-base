import { Logger } from '@nestjs/common';
import { Result } from './Result';
import UseCaseError from './UseCaseError';

export class PineconeDeleteError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, PineconeDeleteError.name);
  }
}

export class PineconeUpsertError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, PineconeUpsertError.name);
  }
}

export class PineconeGetMatchesError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, PineconeGetMatchesError.name);
  }
}
