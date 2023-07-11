import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { FileRepository } from '../repositories/file.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    private fileRepository: FileRepository,
  ) {}

  async uploadFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
        ACL: 'public-read',
      })
      .promise();

    const createFile = await this.fileRepository.create({
      key: uploadResult.Key,
      name: filename,
      url: uploadResult.Location,
    });

    return createFile;
  }

  async deleteFile(fileId: string) {
    const file = await this.fileRepository.findById(fileId);
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();
    await this.fileRepository.delete(fileId);
  }
}
