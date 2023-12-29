import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  S3UploadError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { CrawlDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { JobStatus, KnowledgeBaseType, Resource } from '@/shared/interfaces';
import { OrganizationService } from '@/module/organization/services/organization.service';
import CreateCrawlJobUseCase from '@/module/bot/useCases/jobs/CreateCrawlJob';
import { isEmpty } from 'lodash';
import CreateExtractFileJobUseCase from '@/module/bot/useCases/jobs/CreateExtractFileJob';
import { S3Service } from '@/module/s3/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { KnowledgeBaseService } from '@/module/organization/services/knowledgeBase.service';
import { AddKnowledgeBaseJobService } from '@/module/organization/services/addKnowledgeBaseJob.service';

type Response = Either<
  Result<UseCaseError>,
  Result<{
    addKnowledgeBaseJobId: string;
    knowledgeBaseId: string;
    extractFileJob?: {
      jobId: string;
      status: JobStatus;
    };
    crawlJob?: {
      jobId: string;
      status: JobStatus;
    };
  }>
>;

@Injectable()
export default class AddKnowledgeBaseToOrganizationUseCase {
  private readonly logger = new Logger(
    AddKnowledgeBaseToOrganizationUseCase.name
  );
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly orgService: OrganizationService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly addKnowledgeBaseJobService: AddKnowledgeBaseJobService,
    private readonly createCrawlJobUseCase: CreateCrawlJobUseCase,
    private readonly createExtractFileJobUseCase: CreateExtractFileJobUseCase
  ) {}
  public async exec({
    crawl,
    files,
    name,
    organizationId,
    type,
  }: {
    organizationId: string;
    name: string;
    type: KnowledgeBaseType;
    crawl: CrawlDTO;
    files: Array<Express.Multer.File>;
  }): Promise<Response> {
    try {
      this.logger.log(`Start add knowledge base to organization`);

      let extractFileJob: {
        jobId: string;
        status: JobStatus;
      };

      let crawlJob: {
        jobId: string;
        status: JobStatus;
      };

      const org = await this.orgService.findById(organizationId);
      if (!org)
        return left(new NotFoundError(Resource.Organization, [organizationId]));

      // * create knowledge base record
      this.logger.log('Creating knowledge base');
      const knowledgeBase = await this.knowledgeBaseService.create({
        type,
        name,
        organizationId,
      });

      // * exec create crawl job
      if (!isEmpty(crawl)) {
        this.logger.log('Create crawl job');
        const result = await this.createCrawlJobUseCase.exec({
          urls: crawl.urls,
          limit: crawl.limit,
          only: crawl.only,
          knowledgeBaseId: knowledgeBase._id,
        });

        if (result.isLeft()) return left(result.value);
        crawlJob = result.value.getValue();
      }

      // * exec create extract file jobs
      if (!isEmpty(files)) {
        let urls: string[] = [];

        const filenames = files.map((file) => file.originalname);

        try {
          urls = await Promise.all([
            ...files.map((file) => {
              return this.s3Service.uploadFile(
                `${knowledgeBase._id}/${file.originalname}`,
                this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                file.buffer
              );
            }),
          ]);
        } catch (e) {
          return left(new S3UploadError(filenames));
        }

        this.logger.log('Create extract file job');
        const result = await this.createExtractFileJobUseCase.exec({
          urls,
          knowledgeBaseId: knowledgeBase._id,
        });
        if (result.isLeft()) return left(result.value);

        extractFileJob = result.value.getValue();
      }

      // * Create add knowledge base job record
      this.logger.log('Create add knowledge base job');
      const addKnowledgeBaseJob = await this.addKnowledgeBaseJobService.create({
        organizationId,
        knowledgeBaseId: knowledgeBase._id,
        ...(extractFileJob?.jobId
          ? { extractFileJobId: extractFileJob.jobId }
          : {}),
        ...(crawlJob?.jobId ? { crawlJobId: crawlJob.jobId } : {}),
      });

      // * add knowledge base to the knowledgeBases[] of the organization
      await this.orgService.upsertKnowledgeBases(
        organizationId,
        knowledgeBase._id
      );

      return right(
        Result.ok({
          addKnowledgeBaseJobId: addKnowledgeBaseJob._id,
          knowledgeBaseId: knowledgeBase._id,
          extractFileJob,
          crawlJob,
        })
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
