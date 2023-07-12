import { FilesService } from '@/module/files/services/files.service';
import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../../services/bot.service';
import { CreateBotResponseDTO } from './dto';

type Response = Either<UnexpectedError, Result<CreateBotResponseDTO>>;

@Injectable()
export default class CreateBotFileUseCase {
  private readonly logger = new Logger(CreateBotFileUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly fileService: FilesService,
  ) {}
  public async exec(
    name = 'default',
    files: Array<Express.Multer.File>,
  ): Promise<Response> {
    try {
      this.logger.log(`Start creating bot with file`);

      if (files.length) {
        return left(new InvalidInputError('files is required'));
      }

      const uploadFiles = await this.fileService.uploadFile(
        files[0].buffer,
        name,
      );

      // ?: to be discussed

      const bot = await this.botService.create(name);

      return right(Result.ok({ bot }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
