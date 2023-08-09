import { FileValidator } from '@nestjs/common';
import { extToMimeType } from '@/shared/constants/extToMimeTypes';

export interface CustomUploadFileMimeTypeValidatorOptions {
  fileExtensions: string[];
}

export class CustomUploadFileMimeTypeValidator extends FileValidator {
  private fileExtensions: string[];

  constructor(
    protected readonly validationOptions: CustomUploadFileMimeTypeValidatorOptions,
  ) {
    super(validationOptions);
    this.fileExtensions = this.validationOptions.fileExtensions;
  }

  async isValid(file: Express.Multer.File): Promise<boolean> {
    const { fileTypeFromBuffer } = await (eval(
      'import("file-type")',
    ) as Promise<typeof import('file-type')>);

    const fileType = await fileTypeFromBuffer(file.buffer);

    return this.fileExtensions.includes(fileType.ext);
  }

  public buildErrorMessage(): string {
    return `Validation failed. Expected file type is: ${this.fileExtensions.join(
      ',',
    )}`;
  }
}
