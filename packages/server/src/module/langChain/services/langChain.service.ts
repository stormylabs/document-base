import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document as LCDocument } from 'langchain/document';
import { Vector } from '@pinecone-database/pinecone';

@Injectable()
export class LangChainService {
  private tokenSplitter: RecursiveCharacterTextSplitter;
  private readonly logger = new Logger(LangChainService.name);
  constructor(
    @Inject(ChatOpenAI) public readonly chat: ChatOpenAI,
    @Inject(ChatOpenAI) public readonly chat16k: ChatOpenAI,
    @Inject(OpenAI) public readonly llm: OpenAI,
    @Inject(OpenAIEmbeddings) public readonly embedder: OpenAIEmbeddings,
  ) {
    this.tokenSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
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

  async splitDocuments(
    documents: LCDocument[],
    docHeader: string,
    url: string,
  ) {
    return this.tokenSplitter.splitDocuments(documents, {
      chunkHeader: `DOCUMENT NAME: ${docHeader}\n\nURL: ${url}\n\n---\n\n`,
      appendChunkOverlapHeader: true,
    });
  }
}
