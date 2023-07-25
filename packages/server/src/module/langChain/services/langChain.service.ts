import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document as LCDocument } from 'langchain/document';
import { Vector } from '@pinecone-database/pinecone';
import { templates } from '@/shared/constants/template';
import { chunkSubstr } from '@/shared/utils/web-utils';
import { encode } from 'gpt-3-encoder';
import { TOKEN_LIMIT } from '@/shared/constants';

@Injectable()
export class LangChainService {
  private tokenSplitter: TokenTextSplitter;
  private readonly logger = new Logger(LangChainService.name);
  constructor(
    @Inject(ChatOpenAI) public readonly chat: ChatOpenAI,
    @Inject(OpenAI) public readonly llm: OpenAI,
    @Inject(OpenAIEmbeddings) public readonly embedder: OpenAIEmbeddings,
  ) {
    this.tokenSplitter = new TokenTextSplitter({
      encodingName: 'gpt2',
      chunkSize: 300,
      chunkOverlap: 20,
    });
  }

  public async embedQuery(query: string): Promise<number[]> {
    return this.embedder.embedQuery(query);
  }

  public async getVectors(
    id: string,
    doc: LCDocument,
    metadata: Vector['metadata'],
  ): Promise<Vector> {
    const embedding = await this.embedder.embedQuery(doc.pageContent);
    return {
      id,
      values: embedding,
      metadata,
    };
  }

  public createInquiryChain(template: string, inputVariables: string[]) {
    return new LLMChain({
      llm: this.llm,
      prompt: new PromptTemplate({
        template,
        inputVariables,
      }),
    });
  }

  createChatInquiryChain(template: string, inputVariables: string[]) {
    return new LLMChain({
      llm: this.chat,
      prompt: new PromptTemplate({
        template,
        inputVariables,
      }),
    });
  }

  async splitDocuments(documents: LCDocument[]) {
    return this.tokenSplitter.splitDocuments(documents);
  }

  async summarize(text: string, inquiry: string) {
    const chain = this.createChatInquiryChain(templates.summarizerTemplate, [
      'document',
      'inquiry',
    ]);

    const result = await chain.call({
      document: text,
      inquiry,
    });

    return result.text;
  }

  async summarizeLongDocument(text: string, inquiry: string) {
    const templateTokenLength = encode(templates.summarizerTemplate).length;
    const textTokenLength = encode(text).length;
    this.logger.log(
      `Text length: ${textTokenLength}, template length: ${templateTokenLength}, total: ${
        textTokenLength + templateTokenLength
      }`,
    );

    if (textTokenLength + templateTokenLength <= TOKEN_LIMIT) {
      this.logger.log(`Summarized text is short enough`);
      return text;
    }
    const chunks = chunkSubstr(text);

    this.logger.log(
      `Split text into ${chunks.length} chunks, approx tokens: ${
        encode(chunks[0]).length
      }`,
    );

    const summaries = await Promise.all(
      chunks.map(async (chunk) => await this.summarize(chunk, inquiry)),
    );

    const result = summaries.join('\n');

    if (encode(result).length + templateTokenLength <= TOKEN_LIMIT) {
      this.logger.log(
        `Summarized result tokens: ${
          encode(result + templates.summarizerTemplate).length
        }`,
      );
      return result;
    }

    this.logger.log(`Summarized text is still too long, summarizing again`);
    return this.summarizeLongDocument(result, inquiry);
  }
}
