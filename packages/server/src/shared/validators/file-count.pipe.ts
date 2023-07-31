import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

export interface CustomFileCountValidationPipeOptions {
  maxCount: number;
  minCount: number;
}

@Injectable()
export class CustomFileCountValidationPipe implements PipeTransform {
  private maxCount: number;
  private minCount: number;

  constructor(
    protected readonly validationOptions: CustomFileCountValidationPipeOptions,
  ) {
    this.maxCount = this.validationOptions.maxCount;
    this.minCount = this.validationOptions.minCount;
  }

  transform(
    files: Express.Multer.File | Express.Multer.File[],
  ): Express.Multer.File | Express.Multer.File[] {
    if (files === undefined || files === null) {
      throw new BadRequestException('Validation failed (file expected)');
    }

    if (
      Array.isArray(files) &&
      !(files.length >= this.minCount && files.length < this.maxCount)
    ) {
      throw new BadRequestException(
        `Validation failed. Files count must be more than ${this.minCount} and less then ${this.maxCount}.`,
      );
    }

    return files;
  }
}
