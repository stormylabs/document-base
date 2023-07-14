import * as dotenv from 'dotenv';
dotenv.config();

export const TOKEN_LIMIT = 7500;

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
];

export const DEFAULT_FALLBACK_MSG =
  "I'm sorry, but I'm not able to answer your question right now as I don't have enough information. However, I'll do my best to help you. Can you please provide me with more details or rephrase your question so I can better understand what you're asking?";
