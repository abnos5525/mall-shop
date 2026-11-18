import { BadRequestException } from '@nestjs/common';
import { assertHttpOrHttpsUrl } from './url.util';

describe('assertHttpOrHttpsUrl', () => {
  it('accepts https URLs', () => {
    expect(assertHttpOrHttpsUrl('https://example.com/path', 'destinationUrl')).toBe(
      'https://example.com/path',
    );
  });

  it('rejects javascript scheme', () => {
    expect(() => assertHttpOrHttpsUrl('javascript:alert(1)', 'destinationUrl')).toThrow(
      BadRequestException,
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => assertHttpOrHttpsUrl('not-a-url', 'destinationUrl')).toThrow(BadRequestException);
  });
});