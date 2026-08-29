import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

/**
 * MinIO 对象存储服务。
 * 配置来源：src/config/config.yml 的 minio 段。
 * Client 仅在发起请求时才连接，MinIO 未启动时不影响应用启动。
 */
@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      endPoint: this.config.get<string>('minio.endPoint') ?? '127.0.0.1',
      port: this.config.get<number>('minio.port') ?? 9000,
      useSSL: this.config.get<boolean>('minio.useSSL') ?? false,
      accessKey: this.config.get<string>('minio.accessKey') ?? 'minioadmin',
      secretKey: this.config.get<string>('minio.secretKey') ?? '',
    });
    this.bucket = this.config.get<string>('minio.bucket') ?? 'demo';
  }

  get minio(): Client {
    return this.client;
  }

  get bucketName(): string {
    return this.bucket;
  }

  async ping(): Promise<'up' | 'down'> {
    try {
      await this.client.bucketExists(this.bucket);
      return 'up';
    } catch (error) {
      this.logger.warn(`MinIO 不可用: ${(error as Error).message}`);
      return 'down';
    }
  }
}
