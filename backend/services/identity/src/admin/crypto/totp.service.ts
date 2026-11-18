import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import type { AppConfig } from '../../config/app.config';

@Injectable()
export class TotpService {
  constructor(private readonly configService: ConfigService) {}

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  verify(secret: string, token: string): boolean {
    return authenticator.verify({ token, secret });
  }

  encryptSecret(secret: string): string {
    const key = this.deriveKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`;
  }

  decryptSecret(payload: string): string {
    const [ivB64, tagB64, dataB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('invalid encrypted secret');
    }
    const key = this.deriveKey();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return plain.toString('utf8');
  }

  private deriveKey(): Buffer {
    const app = this.configService.get<AppConfig>('app');
    const material = app?.sessionSecret ?? 'insecure-dev-secret';
    return createHash('sha256').update(material).digest();
  }
}