import { createHash } from 'node:crypto';

export function hashVisitor(ip: string | undefined, userAgent: string | undefined, pepper: string): string | null {
  if (!ip) {
    return null;
  }
  const material = `${pepper}:${ip}:${userAgent ?? ''}`;
  return createHash('sha256').update(material).digest('hex');
}