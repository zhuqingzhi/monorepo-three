import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, type Pool, type RowDataPacket } from 'mysql2/promise';

/**
 * MySQL 连接池服务。
 * 配置来源：src/config/config.yml 的 mysql 段。
 * 池在首次查询时才真正建连，服务未启动 MySQL 时不影响应用启动。
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = createPool({
      host: this.config.get<string>('mysql.host'),
      port: this.config.get<number>('mysql.port'),
      user: this.config.get<string>('mysql.username'),
      password: this.config.get<string>('mysql.password'),
      database: this.config.get<string>('mysql.database'),
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
    });
  }

  async query<T extends RowDataPacket>(sql: string, params?: unknown[]): Promise<T[]> {
    const [rows] = await this.pool.query<T[]>(sql, params);
    return rows;
  }

  async ping(): Promise<'up' | 'down'> {
    try {
      await this.pool.query('SELECT 1');
      return 'up';
    } catch (error) {
      this.logger.warn(`MySQL 不可用: ${(error as Error).message}`);
      return 'down';
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end().catch(() => undefined);
  }
}
