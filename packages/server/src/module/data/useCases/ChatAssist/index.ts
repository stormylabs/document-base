import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClientService } from 'src/module/pinecone/pinecone.service';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { templates } from 'src/shared/constants/template';
import {
  getMatchesFromEmbeddings,
  Metadata,
} from 'src/shared/utils/getMatchesFromEmbeddings';
import { ChatOpenAI } from 'langchain/chat_models';
import { summarizeLongDocument } from 'src/shared/utils/summarizer';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ message: string }>
>;

@Injectable()
export default class ChatAssistUseCase {
  private readonly logger = new Logger(ChatAssistUseCase.name);
  constructor(private readonly pinecone: PineconeClientService) {}
  public async exec(
    query: string,
    conversationHistory: string[],
    numOfAnswers: number,
    tag: string,
  ): Promise<Response> {
    try {
      this.logger.log(`Start assisting chat`);
      const llm = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      const inquiryChain = new LLMChain({
        llm,
        prompt: new PromptTemplate({
          template: templates.inquiryTemplate,
          inputVariables: ['userPrompt', 'conversationHistory'],
        }),
      });

      const inquiryChainResult = await inquiryChain.call({
        userPrompt: query,
        conversationHistory,
      });
      const inquiry = inquiryChainResult.text;

      this.logger.log(`Inquiry: ${inquiry}`);

      const embedder = new OpenAIEmbeddings({
        modelName: 'text-embedding-ada-002',
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      const embeddings = await embedder.embedQuery(inquiry);

      const matches = await getMatchesFromEmbeddings(
        embeddings,
        this.pinecone,
        tag,
        2,
      );

      const urls =
        matches &&
        Array.from(
          new Set(
            matches.map((match) => {
              const metadata = match.metadata as Metadata;
              const { url } = metadata;
              return url;
            }),
          ),
        );

      const docs =
        matches &&
        Array.from(
          matches.reduce((map, match) => {
            const metadata = match.metadata as Metadata;
            const { text, url } = metadata;
            if (!map.has(url)) {
              map.set(url, text);
            }
            return map;
          }, new Map()),
        ).map(([_, text]) => text);

      const promptTemplate = new PromptTemplate({
        template: templates.qaTemplate,
        inputVariables: [
          'summaries',
          'question',
          'conversationHistory',
          'urls',
          'numOfAnswers',
        ],
      });

      const chat = new ChatOpenAI({
        streaming: true,
        verbose: true,
        modelName: 'gpt-3.5-turbo',
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      const chain = new LLMChain({
        prompt: promptTemplate,
        llm: chat,
      });

      const allDocs = docs.join('\n');

      const summary =
        allDocs.length > 4000
          ? await summarizeLongDocument({ document: allDocs, inquiry })
          : allDocs;

      const results = await chain.call({
        summaries: summary,
        question: query,
        conversationHistory,
        urls,
        numOfAnswers,
      });

      return right(
        Result.ok<{ message: string }>({ message: JSON.parse(results.text) }),
      );
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
