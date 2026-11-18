import type { OnModuleDestroy} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class MfaChallengeStore implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(configService: ConfigService) {
    const url = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  private async ensure(): Promise<void> {
    if (this.redis.status === 'wait' || this.redis.status === 'end') {
      await this.redis.connect();
    }
  }

  async save(key: string, challenge: string, ttlSeconds: number): Promise<void> {
    await this.ensure();
    await this.redis.set(key, challenge, 'EX', ttlSeconds);
  }

  async assert(key: string, challenge: string): Promise<void> {
    await this.ensure();
    const stored = await this.redis.get(key);
    if (!stored || stored !== challenge) {
      throw new UnauthorizedException('Invalid WebAuthn challenge');
    }
    await this.redis.del(key);
  }
}