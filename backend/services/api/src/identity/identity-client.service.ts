import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { InternalSessionVerification, PublicUserProfile } from '@mall-shop/contracts';
import type { AppConfig } from '../config/app.config';

@Injectable()
export class IdentityClientService {
  constructor(private readonly configService: ConfigService) {}

  async verifyAccessToken(token: string): Promise<InternalSessionVerification & { user?: PublicUserProfile }> {
    const app = this.configService.get<AppConfig>('app');
    const baseUrl = app?.identityServiceUrl ?? 'http://localhost:4100';
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Internal identity verification is not configured');
    }

    const response = await fetch(`${baseUrl}/api/v1/internal/sessions/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Service-Key': secret,
      },
      body: JSON.stringify({ token }),
    });

    if (response.status === 401) {
      throw new UnauthorizedException('Invalid session');
    }
    if (!response.ok) {
      throw new UnauthorizedException('Identity verification failed');
    }

    return (await response.json()) as InternalSessionVerification;
  }
}