import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { HealthResponse, ServiceHealthCheck } from '@mall-shop/contracts';
import type { AppConfig } from '../config/app.config';
import type { PrismaIdentityService } from '../prisma/prisma-identity.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly configService: ConfigService,
  ) {}

  async getHealth(): Promise<HealthResponse> {
    const app = this.configService.get<AppConfig>('app');
    const started = Date.now();
    const checks: ServiceHealthCheck[] = [];
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.push({
        name: 'identity-database',
        status: 'ok',
        latencyMs: Date.now() - started,
      });
    } catch (error) {
      checks.push({
        name: 'identity-database',
        status: 'error',
        latencyMs: Date.now() - started,
        message: error instanceof Error ? error.message : 'database check failed',
      });
    }

    const status = checks.some((check) => check.status === 'error') ? 'error' : 'ok';
    return {
      status,
      service: app?.serviceName ?? 'dropclub-identity',
      version: app?.serviceVersion ?? '0.1.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}