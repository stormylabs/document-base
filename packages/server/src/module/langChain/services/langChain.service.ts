import { Inject, Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { LLMChain, OpenAI, PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document as LCDocument } from 'langchain/document';
import { Vector } from '@pinecone-database/pinecone';

@Injectable()
export class LangChainService {
  private tokenSplitter: TokenTextSplitter;
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
}
