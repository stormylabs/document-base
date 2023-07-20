import { Vector } from '@pinecone-database/pinecone';
import { encode } from 'gpt-3-encoder';
import { camelCase, isDate, isObject, isArray, transform } from 'lodash';
import { TOKEN_LIMIT } from '../constants';

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
  const maxChunkLength = Math.floor(TOKEN_LIMIT / encode(' ').length);

  let index = 0;

  while (index < text.length) {
    let chunkLength = maxChunkLength;
    console.log({ chunkLength });
    while (
      encode(text.slice(index, index + chunkLength)).length > TOKEN_LIMIT
    ) {
      chunkLength--;
    }

    const subtext = text.slice(index, index + chunkLength);
    chunks.push(subtext);
    index += chunkLength;
  }

  return chunks;
}
