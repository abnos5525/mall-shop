import { Controller, Get } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { HealthResponse } from '@mall-shop/contracts';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getHealth(): Promise<HealthResponse> {
    const started = Date.now();
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    const client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    let status: HealthResponse['status'] = 'ok';
    let message: string | undefined;

    try {
      await client.connect();
      const pong = await client.ping();
      if (pong !== 'PONG') {
        status = 'error';
        message = 'unexpected ping response';
      }
    } catch (error) {
      status = 'error';
      message = error instanceof Error ? error.message : 'redis check failed';
    } finally {
      client.disconnect();
    }

    return {
      status,
      service: 'dropclub-worker',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      checks: [
        {
          name: 'redis',
          status,
          latencyMs: Date.now() - started,
          message,
        },
      ],
    };
  }
}