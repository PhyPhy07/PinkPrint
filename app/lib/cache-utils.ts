import { createHash } from 'crypto';

export function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,]/g, '');
}

export function hashInput(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function buildCacheKey(input: string, cacheType: string): string {
  const normalized = normalizeInput(input);
  const combined = `${cacheType}:${normalized}`;
  return hashInput(combined);
}