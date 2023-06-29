import * as Spider from 'node-spider';
import * as TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import * as parse from 'url-parse';
import { Logger } from '@nestjs/common';
const turndownService = new TurndownService();

class Crawler {
  text: string;
  urls: string[];
  url: string;
  spider: Spider | null = {};
  textLengthMinimum = 200;
  private readonly logger = new Logger(Crawler.name);

  constructor(url: string, textLengthMinimum = 200) {
    this.url = url;
    this.textLengthMinimum = textLengthMinimum;

    this.text = '';
    this.spider = {};
    this.urls = [];
  }

  handleRequest = (doc: any) => {
    const $ = cheerio.load(doc.res.body);
    $('script').remove();
    $('#hub-sidebar').remove();
    $('header').remove();
    $('nav').remove();
    $('img').remove();
    // const title = $('title').text() || $('.article-title').text();
    const html = $('body').html();
    const text = turndownService.turndown(html);
    if (text.length > this.textLengthMinimum) {
      this.text = text;
    }

    doc.$('a').each((i: number, elem: any) => {
      const href = doc.$(elem).attr('href')?.split('#')[0];
      const targetUrl = href && doc.resolve(href);
      const targetUrlParts = parse(targetUrl);
      const uParts = parse(this.url);
      if (targetUrl && targetUrlParts.hostname === uParts.hostname) {
        this.urls.push(targetUrl);
      }
    });
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
        keepAlive: false,
        error: (err: any, url: string) => {
          this.logger.log(`[Crawler] Error: ${err} ${url}`);
          reject(err);
        },
        // Called when there are no more requests
        done: () => {
          resolve({ text: this.text, urls: this.urls });
        },
        headers: { 'user-agent': 'node-spider' },
        encoding: 'utf8',
      });
      this.spider.queue(this.url, this.handleRequest);
    });
  };
}

export { Crawler };
