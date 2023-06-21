import { Injectable, Logger } from '@nestjs/common';
import { Vector } from '@pinecone-database/pinecone';
import UnexpectedError, { InvalidInputError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { Crawler, Page } from 'src/shared/utils/crawler';
import {
  sliceIntoChunks,
  truncateStringByBytes,
} from 'src/shared/utils/web-utils';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { summarizeLongDocument } from 'src/shared/utils/summarizer';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { uuid } from 'uuidv4';
import Bottleneck from 'bottleneck';
import { PineconeClientService } from 'src/module/pinecone/pinecone.service';

type Response = Either<
  InvalidInputError | UnexpectedError,
  Result<{ message: string }>
>;

const limiter = new Bottleneck({
  minTime: 50,
});

@Injectable()
export default class CrawlWebsitesUseCase {
  private readonly logger = new Logger(CrawlWebsitesUseCase.name);
  constructor(private readonly pinecone: PineconeClientService) {}
  public async exec(
    urls: string[],
    limit: number,
    tag: string,
    summarize?: boolean,
  ): Promise<Response> {
    try {
      this.logger.log(`Start crawling website`);

      const { status } = await this.pinecone.client.describeIndex({
        indexName: process.env.PINECONE_INDEX,
      });

      console.log({ status });

      const crawler = new Crawler(urls, limit, 200);
      const pages = (await crawler.start()) as Page[];

      const index = this.pinecone && this.pinecone.index;

      this.logger.log('Deleting existing vectors');
      await index._delete({
        deleteRequest: {
          filter: {
            tag,
          },
        },
      });

      for (let i = 0; i < pages.length; i += 50) {
        this.logger.log(`Processing batch ${i}/${pages.length}`);
        const batch = pages.slice(i, i + 10);
        const documents = await Promise.all(
          batch.map(async (row) => {
            const splitter = new TokenTextSplitter({
              encodingName: 'gpt2',
              chunkSize: 300,
              chunkOverlap: 20,
            });

            const pageContent = summarize
              ? await summarizeLongDocument({ document: row.text })
              : row.text;

            const docs = splitter.splitDocuments([
              new Document({
                pageContent,
                metadata: {
                  url: row.url,
                  text: truncateStringByBytes(pageContent, 36000),
                },
              }),
            ]);
            return docs;
          }),
        );

        let counter = 0;

        //Embed the documents
        const getEmbedding = async (doc: Document) => {
          const embedder = new OpenAIEmbeddings({
            modelName: 'text-embedding-ada-002',
            openAIApiKey: process.env.OPENAI_API_KEY,
          });
          const embedding = await embedder.embedQuery(doc.pageContent);
          process.stdout.write(
            `${Math.floor((counter / documents.flat().length) * 100)}%\r`,
          );
          counter = counter + 1;
          return {
            id: uuid(),
            values: embedding,
            metadata: {
              tag,
              chunk: doc.pageContent,
              url: doc.metadata.url as string,
            },
          } as Vector;
        };
        const rateLimitedGetEmbedding = limiter.wrap(getEmbedding);

        let vectors = [] as Vector[];

        this.logger.log('Creating embeddings');
        vectors = (await Promise.all(
          documents.flat().map((doc) => rateLimitedGetEmbedding(doc)),
        )) as unknown as Vector[];
        const chunks = sliceIntoChunks(vectors, 10);

        this.logger.log('Upserting vectors to index');

        const { status } = await this.pinecone.client.describeIndex({
          indexName: process.env.PINECONE_INDEX,
        });

        console.log({ status2: status });

        await Promise.all(
          chunks.map(async (chunk) => {
            await index.upsert({
              upsertRequest: {
                vectors: chunk as Vector[],
                namespace: '',
              },
            });
          }),
        );
      }

      this.logger.log(`Successfully crawled website`);

      return right(Result.ok<{ message: string }>({ message: 'Done' }));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
