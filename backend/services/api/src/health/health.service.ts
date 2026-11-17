import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { HealthResponse, ServiceHealthCheck } from '@mall-shop/contracts';
import type { AppConfig } from '../config/app.config';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import { aggregateHealthStatus } from './health-status.util';

async function timedCheck(
  name: string,
  fn: () => Promise<void>,
): Promise<ServiceHealthCheck> {
  const started = Date.now();
  try {
    await fn();
    return { name, status: 'ok', latencyMs: Date.now() - started };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'check failed';
    return { name, status: 'error', latencyMs: Date.now() - started, message };
  }
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaBusinessService,
    private readonly configService: ConfigService,
  ) {}

  async getHealth(): Promise<HealthResponse> {
    const app = this.configService.get<AppConfig>('app');
    const checks = await Promise.all([
      timedCheck('business-database', async () => {
        await this.prisma.$queryRaw`SELECT 1`;
      }),
      timedCheck('redis', async () => {
        const redisUrl = app?.redisUrl ?? process.env.REDIS_URL;
        if (!redisUrl) {
          throw new Error('REDIS_URL is not configured');
        }
        const { default: Redis } = await import('ioredis');
        const client = new Redis(redisUrl, {
          connectTimeout: 2_000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });
        try {
          await client.connect();
          const pong = await client.ping();
          if (pong !== 'PONG') {
            throw new Error('unexpected ping response');
          }
        } finally {
          client.disconnect();
        }
      }),
    ]);

    const status = aggregateHealthStatus(checks);
    return {
      status,
      service: app?.serviceName ?? 'dropclub-api',
      version: app?.serviceVersion ?? '0.1.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

}