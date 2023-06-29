import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document as LCDocument } from 'langchain/document';
import { Vector } from '@pinecone-database/pinecone';
import { templates } from '@/shared/constants/template';
import { encode } from 'gpt-3-encoder';
import { chunkSubstr } from '@/shared/utils/web-utils';

@Injectable()
export class LangChainService {
  private tokenSplitter: TokenTextSplitter;
  private readonly logger = new Logger(LangChainService.name);
  constructor(
    @Inject(ChatOpenAI) private readonly chat: ChatOpenAI,
    @Inject(OpenAI) private readonly llm: OpenAI,
    @Inject(OpenAIEmbeddings) private readonly embedder: OpenAIEmbeddings,
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

  public async getVector(
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
    const templateLength = encode(templates.summarizerTemplate).length;
    this.logger.log(`Text and template length ${text.length + templateLength}`);
    if (encode(text).length + templateLength <= 7000) {
      return text;
    }
    const chunks = chunkSubstr(text, 7000 - templateLength - 1);

    const summaries = await Promise.all(
      chunks.map(async (chunk) => await this.summarize(chunk, inquiry)),
    );

    const result = summaries.join('\n');
    this.logger.log(
      `Summarized text and temaplte length ${result.length + templateLength}`,
    );
    if (encode(result).length + templateLength <= 8192) {
      return result;
    }

    this.logger.log(`Summarized text is still too long, summarizing again`);
    return this.summarizeLongDocument(result, inquiry);
  }
}
