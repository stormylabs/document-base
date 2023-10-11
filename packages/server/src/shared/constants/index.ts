import * as dotenv from 'dotenv';
import { JobType } from '../interfaces';
dotenv.config();

export const TOKEN_LIMIT = 3000;

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;

export const JOB_TIMEOUT = 5 * ONE_MINUTE;

export const DOCUMENT_LIMIT =
  process.env.NODE_ENV === 'production' ? 2000 : 500;

export const EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.zip',
  '.rar',
  '.tar',
  '.gz',
  '.exe',
  '.dll',
  '.iso',
  '.mp3',
  '.mp4',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.swf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.svg',
  '.ico',
  '.webp',
  '.tif',
  '.tiff',
  '.heic',
];

export const HTML_CONTENT_TYPES = ['text/html', 'application/xhtml+xml'];

export const DEFAULT_FALLBACK_MSG =
  "I'm sorry, but I'm not able to answer your question right now as I don't have enough information. However, I'll do my best to help you. Can you please provide me with more details or rephrase your question so I can better understand what you're asking?";

export const DEFAULT_PROMPT =
  'You are a customer facing agent for the organization, answer the question on behalf of the organization.';

export const JOB_TERM_MAPPING: { [key in JobType]: string } = {
  [JobType.WebCrawl]: 'Crawl job',
  [JobType.WebCrawlOrg]: 'Crawl job organization',
  [JobType.DocIndex]: 'Train job',
  [JobType.DocIndexOrg]: 'Train job organization',
  [JobType.FileExtract]: 'File Extract job',
};
