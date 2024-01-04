import { Injectable, Logger } from '@nestjs/common';
import { S3, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class S3Service {
  s3: S3;

  private readonly logger = new Logger(S3Service.name);
  constructor(private readonly config: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: config.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(filePath: string, bucket: string, buffer: Buffer) {
    this.logger.log(`Start uploading files to s3 bucket`);

    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: this.config.get<string>('AWS_PUBLIC_BUCKET_NAME'),
        Key: filePath,
        Body: buffer,
        ACL: 'public-read',
      },
      tags: [], // optional tags
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });

    const uploadResult = await parallelUploads3.done();

    return (uploadResult as any).Location;
  }

  async deleteFile(bucket: string, filePath: string) {
    this.logger.log(`Start deleting file from s3 bucket`);

    const input = {
      Bucket: bucket,
      Key: filePath,
    };

    const deleteCommand = new DeleteObjectCommand(input);

    const deleteResult = await this.s3.send(deleteCommand);

    return deleteResult;
  }
}
