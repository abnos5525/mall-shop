import type { OnModuleDestroy } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { initDataReplayKey } from '../telegram/telegram-init-data';

@Injectable()
export class InitDataReplayService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  }

  async onModuleDestroy(): Promise<void> {
    this.redis.disconnect();
  }

  private async ensureConnected(): Promise<void> {
    if (this.redis.status === 'wait' || this.redis.status === 'end') {
      await this.redis.connect();
    }
  }

  async assertFirstUse(rawInitData: string, ttlSeconds: number): Promise<boolean> {
    await this.ensureConnected();
    const key = initDataReplayKey(rawInitData);
    const inserted = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    return inserted === 'OK';
  }
}