import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, { NotFoundError } from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document as LCDocument } from 'langchain/document';
import {
  sliceIntoChunks,
  truncateStringByBytes,
} from '@/shared/utils/web-utils';
import { PineconeClientService } from '@/module/pinecone/pinecone.service';
import Bottleneck from 'bottleneck';
import { getEmbedding } from '@/shared/utils/getEmeddings';
import { ConfigService } from '@nestjs/config';
import { Vector } from '@pinecone-database/pinecone';
import { JobStatus } from '@/shared/interfaces';
import { BotService } from '@/module/bot/services/bot.service';
import { DocIndexJobService } from '../../services/docIndexJob.service';

type Response = Either<
  NotFoundError | UnexpectedError,
  Result<{
    jobId: string;
    botId: string;
    status: JobStatus;
    createdAt: Date;
    limit: number;
    progress: number;
  }>
>;

@Injectable()
export default class IndexDocumentUseCase {
  private readonly logger = new Logger(IndexDocumentUseCase.name);
  constructor(
    private readonly pineconeService: PineconeClientService,
    private readonly botService: BotService,
    private readonly docIndexJobService: DocIndexJobService,
    private readonly configService: ConfigService,
  ) {}
  public async exec(
    botId: string,
    jobId: string,
    document: { _id: string; sourceName: string; content: string },
  ): Promise<Response> {
    try {
      this.logger.log(`Start indexing document`);

      const bot = await this.botService.findById(botId);

      if (!bot) {
        return left(new NotFoundError('Bot not found'));
      }
      const docIndexJob = await this.docIndexJobService.findById(jobId);
      if (!docIndexJob) {
        return left(new NotFoundError('DocIndexJob not found'));
      }
      if (docIndexJob.status === JobStatus.Finished) {
        return right(Result.ok());
      }

      if (docIndexJob.indexedCount === bot.documents.length) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Finished);
        return right(Result.ok());
      }

      if (docIndexJob.status === JobStatus.Pending) {
        await this.docIndexJobService.updateStatus(jobId, JobStatus.Running);
      }

      this.logger.log('Start splitting document');
      const splitter = new TokenTextSplitter({
        encodingName: 'gpt2',
        chunkSize: 300,
        chunkOverlap: 20,
      });

      const docs = await splitter.splitDocuments([
        new LCDocument({
          pageContent: document.content,
          metadata: {
            botId,
            sourceName: document.sourceName,
            text: truncateStringByBytes(document.content, 36000),
          },
        }),
      ]);
      this.logger.log(`Split document successfully: ${docs.length} chunks`);

      const limiter = new Bottleneck({
        minTime: 50,
      });

      const rateLimitedGetEmbedding = limiter.wrap(getEmbedding);
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');

      const vectors = await Promise.all(
        docs
          .flat()
          .map((doc) => rateLimitedGetEmbedding(document._id, doc, apiKey)),
      );

      this.logger.log(`Get embeddings successfully: ${vectors.length} vectors`);

      const chunks = sliceIntoChunks(vectors, 10);
      const index = this.pineconeService.index;

      this.logger.log(`Start indexing ${chunks.length} chunks`);

      await Promise.all(
        chunks.map((chunk) =>
          index.upsert({
            upsertRequest: {
              vectors: chunk as Vector[],
              namespace: '',
            },
          }),
        ),
      );

      this.logger.log(`Indexing is done`);
      await this.docIndexJobService.incrementIndexedCount(jobId);

      this.logger.log(`Document is indexed successfully`);
      return right(Result.ok());
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
