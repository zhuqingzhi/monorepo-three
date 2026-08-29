import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis 服务。
 * 配置来源：src/config/config.yml 的 redis 段。
 * lazyConnect + 错误监听：Redis 未启动时不影响应用启动。
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port') ?? 6379,
      password: this.config.get<string>('redis.password') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      retryStrategy: (times: number) => Math.min(times * 500, 3000),
    });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis 连接异常: ${error.message}`);
    });
  }

  get redis(): Redis {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Redis 已连接');
    } catch {
      this.logger.warn('Redis 未连接（请在 config.yml 检查配置并确认服务已启动）');
    }
  }

  async ping(): Promise<'up' | 'down'> {
    try {
      const reply = await this.client.ping();
      return reply === 'PONG' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => this.client.disconnect());
  }
}
