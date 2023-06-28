import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './bot.controller';
import { BotRepository } from './repositories/bot.repository';
import { Bot, BotSchema } from './schemas/bot.schema';
import { BotService } from './services/bot.service';
import CreateBotUseCase from './useCases/CreateBot';
import UpdateBotUseCase from './useCases/UpdateBotInfo';
import SaveAndIndexDocsUseCase from './useCases/SaveAndIndexDocs';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentService } from './services/document.service';
import { DocumentSchema, Document } from './schemas/document.schema';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Bot.name,
        schema: BotSchema,
      },
      {
        name: Document.name,
        schema: DocumentSchema,
      },
    ]),
    forwardRef(() => DataModule),
  ],
  controllers: [BotController],
  providers: [
    BotRepository,
    BotService,
    DocumentRepository,
    DocumentService,
    CreateBotUseCase,
    UpdateBotUseCase,
    SaveAndIndexDocsUseCase,
  ],
  exports: [BotService],
})
export class BotModule {}
