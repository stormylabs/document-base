import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  InvalidInputError,
  NotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { BotService } from '../../services/bot.service';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { summarizeLongDocument } from 'src/shared/utils/summarizer';
import { templates } from '@/shared/constants/template';
import {
  getMatchesFromEmbeddings,
  Metadata,
} from '@/shared/utils/getMatchesFromEmbeddings';
import { LangChainService } from '@/module/langChain/services/langChain.service';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ message: string }>
>;

@Injectable()
export default class MessageBotUseCase {
  private readonly logger = new Logger(MessageBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly pineconeService: PineconeClientService,
    private readonly langChainService: LangChainService,
  ) {}

  public async exec(
    botId: string,
    message: string,
    conversationHistory: string[],
  ): Promise<Response> {
    try {
      this.logger.log(`Start message with bot`);

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new NotFoundError('Bot not found'));

      this.logger.log(`User's message: ${message}`);

      const inquiryChain = this.langChainService.createInquiryChain(
        templates.inquiryTemplate,
        ['userPrompt', 'conversationHistory'],
      );

      const inquiryChainResult = await inquiryChain.call({
        userPrompt: message,
        conversationHistory,
      });
      const inquiry = inquiryChainResult.text;

      this.logger.log(
        `Summarized inquiry with conversation history: ${inquiry}`,
      );

      const embeddings = await this.langChainService.embedQuery(inquiry);

      this.logger.log('Created embeddings from inquiry');

      const matches = await getMatchesFromEmbeddings(
        botId,
        this.pineconeService.index,
        embeddings,
        5,
      );
      this.logger.log(`Matched embeddings from inquiry: ${matches.length}`);

      const sourceNames =
        matches &&
        Array.from(
          new Set(
            matches.map((match) => {
              const metadata = match.metadata as Metadata;
              const { sourceName } = metadata;
              return sourceName;
            }),
          ),
        );

      const matchedFullText =
        matches &&
        Array.from(
          matches.reduce((map, match) => {
            const metadata = match.metadata as Metadata;
            const { text, sourceName } = metadata;
            if (!map.has(sourceName)) {
              map.set(sourceName, text);
            }
            return map;
          }, new Map()),
        ).map(([_, text]) => text);

      const chatChain = this.langChainService.createChatInquiryChain(
        templates.qaTemplate,
        ['summaries', 'question', 'conversationHistory', 'urls'],
      );

      const combinedFullText = matchedFullText.join('\n');

      const summary =
        combinedFullText.length > 4000
          ? await summarizeLongDocument({ document: combinedFullText, inquiry })
          : combinedFullText;

      const results = await chatChain.call({
        summaries: summary,
        question: message,
        conversationHistory,
        urls: sourceNames,
      });

      return right(Result.ok({ message: results.text }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
