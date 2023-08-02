import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  UnfinishedDocIndexJobsError,
  BotNotFoundError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import { templates } from '@/shared/constants/template';
import { LangChainService } from '@/module/langChain/services/langChain.service';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '@/module/bot/services/docIndexJob.service';
import { MessageBotResponseDTO } from './dto';
import {
  LangChainCallError,
  LangChainGetEmbeddingError,
  LangChainSummarizeError,
} from '@/shared/core/LangChainError';
import { PineconeGetMatchesError } from '@/shared/core/PineconeError';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { PromptTemplate } from 'langchain';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

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

      const vectorStore = await PineconeStore.fromExistingIndex(
        this.langChainService.embedder,
        { pineconeIndex: this.pineconeService.index },
      );

      const model = this.langChainService.llm;

      const template = `${bot.prompt}\n ${templates.qaTemplate}`;

      const k = 2;

      const result = await vectorStore.similaritySearchWithScore(message, k);

      if (result.length === 0 || result[0][1] < 0.75) {
        return right(Result.ok({ message: bot.fallbackMessage }));
      }

      const prompt = new PromptTemplate({
        template,
        inputVariables: ['question'],
      });

      const ch = new ChatMessageHistory(
        conversationHistory.map((x) => {
          if (x.slice(0, 4) === 'user') return new HumanChatMessage(x.slice(5));
          return new AIChatMessage(x.slice(10));
        }),
      );

      const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever(k, {
          botId: bot._id,
        }),
        {
          questionGeneratorChainOptions: {
            template: templates.inquiryTemplate,
          },
          qaChainOptions: {
            type: 'stuff',
            prompt,
          },
          memory: new BufferMemory({
            memoryKey: 'chat_history',
            inputKey: 'question', // The key for the input to the chain
            outputKey: 'text', // The key for the final conversational output of the chain
            returnMessages: true, // If using with a chat model (e.g. gpt-3.5 or gpt-4)
            chatHistory: ch,
          }),
          returnSourceDocuments: true,
        },
      );

      const response = await chain.call({
        chat_history: ch,
        question: message,
      });

      const urls = response.sourceDocuments.map(
        (doc) => doc.metadata.sourceName,
      );

      const responseWithSource =
        response.text +
        '\n\nSource: ' +
        urls.map((url) => `[${url}](${url})`).join('\n\n');

      return right(Result.ok({ message: responseWithSource }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
