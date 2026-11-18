import { BadRequestException } from '@nestjs/common';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function assertHttpOrHttpsUrl(value: string, fieldName: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new BadRequestException(`${fieldName} must be a valid URL`);
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new BadRequestException(`${fieldName} must use http or https`);
  }
  return parsed.toString();
}