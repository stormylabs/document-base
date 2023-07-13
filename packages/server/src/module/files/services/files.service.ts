import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { FileRepository } from '../repositories/file.repository';
import { left } from '@/shared/core/Result';
import { FileNotFoundError } from '@/shared/core/AppError';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    private readonly configService: ConfigService,
    private fileRepository: FileRepository,
  ) {}

  async uploadFile(dataBuffer: Buffer, filename: string) {
    this.logger.log(`Start uploading files into s3 bucket`);
    const s3 = new S3();

    const createFile = await this.fileRepository.create({
      name: filename,
    });

    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${createFile._id}`,
        ACL: 'public-read',
      })
      .promise();

    const updateFile = await this.fileRepository.update(createFile?._id, {
      name: filename,
      url: uploadResult.Location,
    });

    return updateFile;
  }

  async deleteFile(fileId: string) {
    this.logger.log(`Start deleting file by fileId`);
    const file = await this.fileRepository.findById(fileId);

    if (!file) {
      return left(new FileNotFoundError());
    }

    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file._id,
      })
      .promise();

    return this.fileRepository.delete(fileId);
  }
}
