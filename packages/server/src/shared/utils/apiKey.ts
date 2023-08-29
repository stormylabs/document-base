import * as crypto from 'crypto';

export function generateKey(size = 32, format: BufferEncoding = 'base64') {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

export function generateSecretHash(key) {
  const salt = crypto.randomBytes(8).toString('hex');
  const buffer = crypto.scryptSync(key, salt, 64) as Buffer;
  return `${buffer.toString('hex')}.${salt}`;
}

export function compareKeys(storedKey, suppliedKey) {
  const [hashedPassword, salt] = storedKey.split('.');

  const buffer = crypto.scryptSync(suppliedKey, salt, 64) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, 'hex'), buffer);
}
