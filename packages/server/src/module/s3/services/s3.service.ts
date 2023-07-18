import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  s3: S3;
  private readonly logger = new Logger(S3Service.name);
  constructor() {
    this.s3 = new S3();
  }

  async uploadFile(filePath: string, bucket: string, buffer: Buffer) {
    this.logger.log(`Start uploading files to s3 bucket`);

    const uploadResult = await this.s3
      .upload({
        Bucket: bucket,
        Body: buffer,
        Key: filePath,
        ACL: 'public-read',
      })
      .promise();

    return uploadResult.Location;
  }

  async deleteFile(bucket: string, filePath: string) {
    this.logger.log(`Start deleting file from s3 bucket`);

    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: filePath,
      })
      .promise();
  }
}
