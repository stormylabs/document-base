import { Vector } from '@pinecone-database/pinecone';
import { encode } from 'gpt-3-encoder';
import { camelCase, isDate, isObject, isArray, transform } from 'lodash';
import { TOKEN_LIMIT } from '../constants';
import * as path from 'path';
import * as parse from 'url-parse';

export const camelize = (obj: any) =>
  transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key as string);
    if (isDate(value)) {
      acc[camelKey] = value;
    } else if (isObject(value)) {
      acc[camelKey] = camelize(value);
    } else {
      acc[camelKey] = value;
    }
  });

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

export const sliceIntoChunks = (arr: Vector[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize),
  );
};

export function chunkSubstr(text: string) {
  const chunks = [];
  let i = 0;
  let subtext = text;
  while (i < text.length) {
    let chunkLength = subtext.length;
    let tokens = encode(subtext).length;
    while (tokens > TOKEN_LIMIT && chunkLength > 1) {
      chunkLength = Math.floor(chunkLength / 2);
      subtext = text.slice(i, i + chunkLength);
      tokens = encode(subtext).length;
    }
    const chunk = subtext.slice(0, chunkLength);
    chunks.push(chunk);
    i += chunkLength;
    subtext = text.slice(i);
  }

  return chunks;
}

export const extractExtensionFromUrl = (url: string) => {
  const parsedUrl = parse(encodeURI(url));
  const extension = path.extname(parsedUrl.pathname);
  return extension;
};
