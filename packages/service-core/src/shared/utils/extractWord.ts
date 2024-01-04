import axios from 'axios';
import * as WordExtractor from 'word-extractor';

export class ExtractWord {
  private readonly wordExtractor: WordExtractor;
  private readonly url: string;

  constructor(url: string) {
    this.wordExtractor = new WordExtractor();
    this.url = url;
  }

  async getFileBufferFromUrl(): Promise<Buffer> {
    try {
      const arrayBuffer = await axios
        .get(this.url, {
          responseType: 'arraybuffer',
        })
        .then((res) => res.data);

      return Promise.resolve(arrayBuffer);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async start() {
    const fileBuffer = await this.getFileBufferFromUrl();
    try {
      const value = await this.wordExtractor.extract(fileBuffer);

      return Promise.resolve({
        text: value.getBody(),
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
