import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { requestIdPlugin } from './common/plugins/request-id.plugin';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, bodyLimit: 1_048_576 }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(requestIdPlugin);
  await fastify.register(cookie);
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  app.enableCors({
    origin: [appConfig?.frontendOrigin ?? 'http://localhost:3000', appConfig?.adminOrigin ?? 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (appConfig?.swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DropClub Identity Service')
      .setDescription('Authentication, sessions and identity endpoints.')
      .setVersion(appConfig.serviceVersion)
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
      useGlobalPrefix: false,
    });
  }

  const port = appConfig?.port ?? 4100;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();