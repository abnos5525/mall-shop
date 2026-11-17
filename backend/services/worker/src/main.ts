import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');

  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const port = Number(config.get('WORKER_PORT') ?? 4200);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();