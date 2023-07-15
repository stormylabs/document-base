import { Logger } from '@nestjs/common';
import request from 'request';
import pdf from 'pdf-parse';

export class ExtractPDF {
  url: string;
  dataBuffer: Buffer;
  text: string;
  textLengthMinimum = 200;

  private readonly logger = new Logger(ExtractPDF.name);

  constructor(url: string, textLengthMinimum) {
    this.url = url;
    this.textLengthMinimum = textLengthMinimum;
  }

  async start() {
    this.logger.log('Start extract data pdf');

    this.dataBuffer = await request.get({ uri: this.url, encoding: null });

    return pdf(this.dataBuffer)
      .then((data) => {
        this.logger.log('Extract file successfully');
        if (data.text > this.textLengthMinimum) {
          this.text = data.text;
        }
      })
      .catch(function (error) {
        this.logger.log(`[ExtractFile] Error: ${error} ${this.url}`);
      });
  }
}
