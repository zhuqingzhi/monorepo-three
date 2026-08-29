import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 1024;

  await app.listen(port);
  new Logger('Bootstrap').log(`服务已启动: http://127.0.0.1:${port}`);
}

void bootstrap();
