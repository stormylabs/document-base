import * as Spider from 'node-spider';
import * as TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import * as parse from 'url-parse';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import { EXTENSIONS, HTML_CONTENT_TYPES } from '../constants';
import { isValidUrl } from './web-utils';

const turndownService = new TurndownService();

class Crawler {
  text: string;
  urls: string[];
  title: string;
  url: string;
  spider: Spider | null = {};
  textLengthMinimum = 200;
  only: boolean;
  private readonly logger = new Logger(Crawler.name);

  constructor(url: string, textLengthMinimum = 200, only = false) {
    this.url = encodeURI(url);
    this.only = only;
    this.textLengthMinimum = textLengthMinimum;

    this.text = '';
    this.title = '';
    this.spider = {};
    this.urls = [];
  }

  decodeBody = (res: any) => {
    let encoding = 'utf8';
    const contentType = res.headers['content-type'] || '';
    const encodingIndex = contentType.indexOf('charset=');
    if (contentType && encodingIndex > -1) {
      encoding = contentType.substring(encodingIndex + 8);
      this.logger.log(`Detected encoding in header: ${contentType}`);
    } else {
      const charset = /<meta.*?charset=['"]?([-\w]+)['"]?/i.exec(res.body);
      encoding = charset ? charset[1] : encoding;
      this.logger.log(`Detected encoding in meta: ${encoding}`);
    }
    this.logger.log(`Decoding body with ${encoding}`);
    return iconv.decode(res.body, encoding);
  };

  handleRequest = (doc: any) => {
    this.logger.log(`Start crawling ${this.url}`);

    const $ = cheerio.load(this.decodeBody(doc.res));

    // * if only eq true skip Identifying new URLs
    if (!this.only) {
      this.logger.log('only if flag is true, skip identifying more urls');

      this.logger.log('Identifying urls');
      doc.$('a').each((i: number, elem: any) => {
        try {
          const href = doc.$(elem).attr('href')?.split('#')[0];
          const targetUrl =
            href && isValidUrl(doc.resolve(href)) && doc.resolve(href);
          const targetUrlParts = parse(encodeURI(targetUrl));
          const uParts = parse(this.url);
          const extension = path.extname(targetUrlParts.pathname);
          const contentType: string = doc.res.headers['content-type'] || '';
          const contentTypeParts = contentType.split(/;\s|;/);
          if (
            !targetUrl ||
            targetUrlParts.hostname !== uParts.hostname ||
            EXTENSIONS.includes(extension.toLowerCase()) ||
            contentTypeParts.every((part) => !HTML_CONTENT_TYPES.includes(part))
          ) {
            this.logger.log(
              `Ignoring url ${targetUrl}, extension: ${extension}, content-type: ${contentType}`,
            );
            return;
          }
          this.urls.push(targetUrl);
        } catch (e) {
          console.log(e);
        }
      });
    }

    $('script').remove();
    $('#hub-sidebar').remove();
    $('img').remove();
    $('style').remove();
    $('noscript').remove();
    $('iframe').remove();

    // $('header').remove();
    // $('nav').remove();
    // $('footer').remove();
    // $('*[class*=footer]').remove();
    // $('*[id*=footer]').remove();
    // $('*[class*=nav]').remove();
    // $('*[id*=nav]').remove();
    const title = $('title').text() || $('.article-title').text();
    const html = $('body').html();

    const text = turndownService.turndown(html);

    this.logger.log('Crawled website successfully');
    if (text.length > this.textLengthMinimum) {
      this.text = text;
      this.title = title;
    }
  };

  start = async () => {
    this.urls = [];
    return new Promise((resolve, reject) => {
      this.spider = new Spider({
        concurrent: 5,
        delay: 0,
        allowDuplicates: false,
        catchErrors: true,
        addReferrer: false,
        xhr: false,
        timeout: 10000,
        keepAlive: false,
        error: (err: any, url: string) => {
          this.logger.log(`[Crawler] Error: ${err} ${url}`);
          reject(err);
        },
        // Called when there are no more requests
        done: () => {
          resolve({ text: this.text, urls: this.urls, title: this.title });
        },
        headers: { 'user-agent': 'node-spider' },
        encoding: null,
      });
      this.logger.log(`Queueing spider for ${this.url}`);

      this.spider.queue(this.url, this.handleRequest);
    });
  };
}

export { Crawler };
