import { Redis } from '@upstash/redis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const restUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const restToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!restUrl || !restToken) {
      this.redis = null;
      return;
    }

    this.redis = Redis.fromEnv();
  }

  async ping() {
    if (!this.redis) {
      this.logger.warn(
        'Redis env vars are missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
      );

      return undefined;
    }

    return this.redis.ping();
  }

  async get(key: string) {
    if (!this.redis) {
      return null;
    }

    return this.redis.get<string>(key);
  }

  async set(key: string, value: string, expiresInSeconds?: number) {
    if (!this.redis) {
      return undefined;
    }

    if (expiresInSeconds) {
      return this.redis.set(key, value, { ex: expiresInSeconds });
    }

    return this.redis.set(key, value);
  }

  async del(key: string) {
    if (!this.redis) {
      return 0;
    }

    return this.redis.del(key);
  }
}
