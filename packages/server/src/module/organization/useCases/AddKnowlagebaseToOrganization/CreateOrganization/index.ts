import { Injectable, Logger } from '@nestjs/common';
import UnexpectedError, {
  NotFoundError,
  S3UploadError,
  UnfinishedJobsError,
} from '@/shared/core/AppError';
import { Either, Result, left, right } from '@/shared/core/Result';
import { CrawlDTO } from './dto';
import UseCaseError from '@/shared/core/UseCaseError';
import { JobType, KnowledgeBaseType, Resource } from '@/shared/interfaces';
import { OrganizationService } from '@/module/organization/services/organization.service';
import { CrawlJobService } from '@/module/bot/services/crawlJob.service';
import { ExtractFileJobService } from '@/module/bot/services/extractFileJob.service';
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
    jobId: string;
  }>
>;

@Injectable()
export default class AddKnowledgeBaseToOrganizationUseCase {
  private readonly logger = new Logger(
    AddKnowledgeBaseToOrganizationUseCase.name,
  );
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly orgService: OrganizationService,
    private readonly crawlJobService: CrawlJobService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly addKnowledgeBaseJobService: AddKnowledgeBaseJobService,
    private readonly extractFileJobService: ExtractFileJobService,
    private readonly createCrawlJobUseCase: CreateCrawlJobUseCase,
    private readonly createExtractFileJobUseCase: CreateExtractFileJobUseCase,
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

      let crawlJobId: string;
      let extractFileJobId: string;

      const org = await this.orgService.findById(organizationId);
      if (!org)
        return left(new NotFoundError(Resource.Organization, [organizationId]));

      const unfinishedCrawlJobs =
        await this.crawlJobService.findUnfinishedJobsByOrgId(organizationId);
      if (unfinishedCrawlJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedCrawlJobs.map((job) => job._id),
            JobType.WebCrawl,
          ),
        );
      }

      const unfinishedExtractFileJobs =
        await this.extractFileJobService.findUnfinishedJobsByOrgId(
          organizationId,
        );
      if (unfinishedExtractFileJobs.length > 0) {
        return left(
          new UnfinishedJobsError(
            unfinishedExtractFileJobs.map((job) => job._id),
            JobType.FileExtract,
          ),
        );
      }

      // * create knowledge base record
      this.logger.log('Creating knowledge base');
      const knowledgeBase = await this.knowledgeBaseService.create({
        type,
        name,
        organizationId,
      });

      if (!isEmpty(crawl)) {
        this.logger.log('Create crawl job');
        const crawlJob = await this.createCrawlJobUseCase.exec({
          organizationId,
          urls: crawl.urls,
          limit: crawl.limit,
        });

        crawlJobId = (crawlJob.value.getValue() as { jobId: string }).jobId;
      }
      if (files.length) {
        let urls: string[] = [];

        const filenames = files.map((file) => file.originalname);

        try {
          urls = await Promise.all([
            ...files.map((file) => {
              return this.s3Service.uploadFile(
                `${organizationId}/${file.originalname}`,
                this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
                file.buffer,
              );
            }),
          ]);
        } catch (e) {
          return left(new S3UploadError(filenames));
        }

        this.logger.log('Create crawl job');
        const extractFileJob = await this.createExtractFileJobUseCase.exec({
          organizationId,
          urls,
        });

        extractFileJobId = (
          extractFileJob.value.getValue() as { jobId: string }
        ).jobId;
      }

      // * Create add knowledge base job record
      this.logger.log('Create add knowledge base job');
      const addKnowledgeBaseJob = await this.addKnowledgeBaseJobService.create({
        crawlJobId,
        extractFileJobId,
        organizationId,
        knowledgeBaseId: knowledgeBase._id,
      });

      return right(
        Result.ok({
          jobId: addKnowledgeBaseJob._id,
        }),
      );
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
