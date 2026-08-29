import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

export interface AppConfig {
  app: {
    name: string;
    port: number;
  };
  mysql: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  minio: {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

/**
 * 读取 src/config/config.yml 并解析为应用配置。
 * dev 与构建产物（dist/config/config.yml 由 nest-cli assets 拷贝）下均可正常工作。
 */
export default (): AppConfig => {
  const filePath = join(__dirname, 'config.yml');
  return load(readFileSync(filePath, 'utf8')) as AppConfig;
};
