import { Logger } from '@nestjs/common';
import { Result } from './Result';
import UseCaseError from './UseCaseError';

export class PineconeDeleteError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, PineconeDeleteError.name);
  }
}
