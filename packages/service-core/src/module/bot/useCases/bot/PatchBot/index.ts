import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../../services/bot.service';
import UseCaseError from '@/shared/core/UseCaseError';
import { DocumentService } from '@/module/bot/services/document.service';

type Response = Either<Result<UseCaseError>, Result<void>>;

@Injectable()
export default class PatchBotUseCase {
  private readonly logger = new Logger(PatchBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
  ) {}
  public async exec(): Promise<Response> {
    try {
      this.logger.log(`Start patching bot`);

      await this.documentService.patch();

      await this.botService.patch();

      this.logger.log(`Patch bot successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
