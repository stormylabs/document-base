import { Logger } from '@nestjs/common';
import { Result } from './Result';
import UseCaseError from './UseCaseError';

export class LangChainCallError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, LangChainCallError.name);
  }
}

export class LangChainSplitDocsError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, LangChainSplitDocsError.name);
  }
}
