import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  UnfinishedDocIndexJobsError,
  BotNotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { templates } from '@/shared/constants/template';
import { LangChainService } from '@/module/langChain/services/langChain.service';
import { Metadata } from 'aws-sdk/clients/appstream';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { MessageBotResponseDTO } from './dto';
import { ChainValues } from 'langchain/schema';
import {
  LangChainCallError,
  LangChainGetEmbeddingError,
  LangChainSummarizeError,
} from '@/shared/core/LangChainError';
import { PineconeGetMatchesError } from '@/shared/core/PineconeError';
import { QueryResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type Response = Either<
  | UnexpectedError
  | UnfinishedDocIndexJobsError
  | BotNotFoundError
  | LangChainCallError
  | LangChainGetEmbeddingError
  | PineconeGetMatchesError
  | LangChainSummarizeError,
  Result<MessageBotResponseDTO>
>;

@Injectable()
export default class MessageBotUseCase {
  private readonly logger = new Logger(MessageBotUseCase.name);
  constructor(
    private readonly botService: BotService,
    private readonly pineconeService: PineconeClientService,
    private readonly langChainService: LangChainService,
    private readonly docIndexJobService: DocIndexJobService,
  ) {}

  public async exec(
    botId: string,
    message: string,
    conversationHistory: string[],
  ): Promise<Response> {
    try {
      this.logger.log(`Start message with bot`);

      const bot = await this.botService.findById(botId);

      if (!bot) return left(new BotNotFoundError());

      const unfinishedJobs = await this.docIndexJobService.findUnfinishedJobs(
        botId,
      );

      if (unfinishedJobs.length > 0) {
        return left(
          new UnfinishedDocIndexJobsError(unfinishedJobs.map((job) => job._id)),
        );
      }

      this.logger.log(`User's message: ${message}`);

      const inquiryChain = this.langChainService.createInquiryChain(
        templates.inquiryTemplate,
        ['userPrompt', 'conversationHistory'],
      );

      let inquiryChainResult: ChainValues;

      try {
        inquiryChainResult = await inquiryChain.call({
          userPrompt: message,
          conversationHistory,
        });
      } catch (e) {
        return left(new LangChainCallError(e.message));
      }

      const inquiry = inquiryChainResult.text;

      this.logger.log(
        `Summarized inquiry with conversation history: ${inquiry}`,
      );

      let embeddings: number[];
      try {
        embeddings = await this.langChainService.embedQuery(inquiry);
      } catch (e) {
        return left(new LangChainGetEmbeddingError(e.message));
      }

      this.logger.log('Created embeddings from inquiry');

      let matches: Array<QueryResponse & { metadata: Metadata }>;
      try {
        matches = await this.pineconeService.getMatches(embeddings, {
          botId,
        });
      } catch (e) {
        return left(new PineconeGetMatchesError(e.message));
      }

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ).map(([_, text]) => text);

      const chatChain = this.langChainService.createChatInquiryChain(
        templates.qaTemplate,
        [
          'summaries',
          'question',
          'conversationHistory',
          'urls',
          'fallbackMessage',
        ],
      );

      const combinedFullText = matchedFullText.join('\n');

      let summary: string;
      try {
        summary = await this.langChainService.summarizeLongDocument(
          combinedFullText,
          inquiry,
        );
      } catch (e) {
        return left(new LangChainSummarizeError(e.message));
      }

      let results: ChainValues;

      try {
        results = await chatChain.call({
          summaries: summary,
          question: inquiry,
          conversationHistory,
          urls: sourceNames,
          fallbackMessage: bot.fallbackMessage,
        });
      } catch (e) {
        return left(new LangChainCallError(e.message));
      }
      return right(Result.ok({ message: results.text }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
