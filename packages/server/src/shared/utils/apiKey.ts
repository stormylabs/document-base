import * as crypto from 'crypto';

export function generateKey(size = 32, format: BufferEncoding = 'base64') {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}
