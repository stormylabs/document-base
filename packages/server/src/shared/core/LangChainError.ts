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

export class LangChainGetVectorsError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, LangChainGetVectorsError.name);
  }
}

export class LangChainGetEmbeddingError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, LangChainGetEmbeddingError.name);
  }
}

export class LangChainSummarizeError extends Result<UseCaseError> {
  public constructor(message: string) {
    super(false, { message } as UseCaseError);
    Logger.log(message, LangChainSummarizeError.name);
  }
}
