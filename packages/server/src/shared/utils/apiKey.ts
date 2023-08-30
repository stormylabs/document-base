import * as crypto from 'crypto';

export function generateAPIKey() {
  const apiKey = crypto.randomUUID();
  return apiKey;
}
