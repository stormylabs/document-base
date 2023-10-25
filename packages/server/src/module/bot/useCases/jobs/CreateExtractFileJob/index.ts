import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  SQSSendMessageError,
} from 'src/shared/core/AppError';
import { Either, Result, left, right } from 'src/shared/core/Result';
import * as path from 'path';

import { BotService } from '@/module/bot/services/bot.service';
import { ExtractFileJobMessage } from '@/shared/interfaces/extractFileJob';
import { SqsMessageService } from '@/module/sqsProducer/services/sqsMessage.service';
import { JobStatus, JobType, Resource } from '@/shared/interfaces';
import { DocumentService } from '@/module/bot/services/document.service';
import { DocumentExtToType } from '@/shared/interfaces/document';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
import { extractExtensionFromUrl } from '@/shared/utils/web-utils';
import UseCaseError from '@/shared/core/UseCaseError';
import { OrganizationService } from '@/module/organization/services/organization.service';

type Response = Either<
  Result<UseCaseError>,
  Result<{ jobId: string; status: JobStatus }>
>;

@Injectable()
export default class CreateExtractFileJobUseCase {
  private readonly logger = new Logger(CreateExtractFileJobUseCase.name);
  constructor(
    private readonly sqsMessageService: SqsMessageService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly botService: BotService,
    private readonly documentService: DocumentService,
    private readonly orgService: OrganizationService,
  ) {}
  public async exec({
    botId,
    organizationId,
    urls,
  }: {
    botId?: string;
    organizationId?: string;
    urls: string[];
  }): Promise<Response> {
    try {
      this.logger.log(`Start creating extract files job`);

      if (botId) {
        const botExists = await this.botService.exists([botId]);
        if (!botExists) return left(new NotFoundError(Resource.Bot, [botId]));
      }

      if (organizationId) {
        const orgExists = await this.orgService.exists([organizationId]);
        if (!orgExists)
          return left(
            new NotFoundError(Resource.Organization, [organizationId]),
          );
      }

      const extractFileJob = await this.extractFileJobService.create({
        initUrls: urls,
        ...(botId ? { botId } : {}),
        ...(organizationId ? { organizationId } : {}),
      });

      const { _id: jobId, status } = extractFileJob;

      const payloads = await this.createPayloads({
        jobId,
        urls,
        ...(botId ? { botId } : {}),
        ...(organizationId ? { organizationId } : {}),
      });

      try {
        await this.sendMessages(jobId, payloads);
      } catch (e) {
        return left(new SQSSendMessageError(e));
      }

      this.logger.log(`Sent ${payloads.length} messages to the queue`);

      this.logger.log(`Extract file job is created successfully`);
      return right(Result.ok({ jobId, status }));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  async sendMessages(jobId: string, payloads: ExtractFileJobMessage[]) {
    await this.sqsMessageService.sendMessages<ExtractFileJobMessage>(
      jobId,
      JobType.FileExtract,
      payloads,
    );
  }

  async createPayloads({
    botId,
    organizationId,
    jobId,
    urls,
  }: {
    jobId: string;
    botId?: string;
    organizationId?: string;
    urls: string[];
  }) {
    const payloads: ExtractFileJobMessage[] = [];
    for (const url of urls) {
      const document = await this.documentService.findBySourceName(url);

      let documentId = '';

      if (!document) {
        const fileExt = extractExtensionFromUrl(url);
        const { _id } = await this.documentService.create({
          sourceName: url,
          type: DocumentExtToType[fileExt],
          title: path.basename(decodeURIComponent(url)),
        });
        documentId = _id;
      } else {
        // replace with a document that was extracted before (same URL)
        documentId = document._id;
        if (document.deletedAt) {
          await this.documentService.restore(document._id);
        }
      }

      payloads.push({
        jobId,
        documentId,
        ...(botId ? { botId } : {}),
        ...(organizationId ? { organizationId } : {}),
      });
    }
    return payloads;
  }
}
