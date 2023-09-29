import * as crypto from 'crypto';

export function generateAPIKey() {
  return crypto.randomUUID();
}
