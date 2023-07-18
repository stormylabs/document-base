import { Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';

export class ExtractPDF {
  url: string;
  textLengthMinimum = 200;
  private readonly logger = new Logger(ExtractPDF.name);

  constructor(url: string, textLengthMinimum = 200) {
    this.url = url;
    this.textLengthMinimum = textLengthMinimum;
  }

  async start() {
    this.logger.log('Start extract data pdf');

    try {
      const data = await pdf(this.url);

      this.logger.log('Extract file successfully');
      if (data?.text?.length > this.textLengthMinimum) {
        return {
          text: data?.text,
        };
      }

      return {
        text: '',
      };
    } catch (error) {
      this.logger.log(`[ExtractFile] Error: ${error} ${this.url}`);

      throw error;
    }
  }
}
