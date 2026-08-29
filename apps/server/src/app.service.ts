import { Injectable } from '@nestjs/common';

import { DatabaseService } from './database/database.service';
import { RedisService } from './redis/redis.service';
import { MinioService } from './storage/minio.service';

export interface ServicesStatus {
  mysql: 'up' | 'down';
  redis: 'up' | 'down';
  minio: 'up' | 'down';
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  services: ServicesStatus;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly minio: MinioService,
  ) {}

  getHello(): { message: string; health: string } {
    return {
      message: 'NestJS 后端服务运行中（配置来自 config.yml）',
      health: 'http://127.0.0.1:1024/health',
    };
  }

  async getHealth(): Promise<HealthReport> {
    const [mysql, redis, minio] = await Promise.all([
      this.database.ping(),
      this.redis.ping(),
      this.minio.ping(),
    ]);

    const services: ServicesStatus = { mysql, redis, minio };
    const allUp = mysql === 'up' && redis === 'up' && minio === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      services,
      timestamp: new Date().toISOString(),
    };
  }
}
