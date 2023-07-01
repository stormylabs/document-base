import { Vector } from '@pinecone-database/pinecone';
import { camelCase, isDate, isObject, isArray, transform } from 'lodash';

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

export function chunkSubstr(text: string, chunkLength: number) {
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    const subtext = text.slice(index, index + chunkLength);
    chunks.push(subtext);
    index += chunkLength;
  }

  return chunks;
}
