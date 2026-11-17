import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { requestIdPlugin } from './common/plugins/request-id.plugin';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 1_048_576,
    }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(requestIdPlugin);
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const allowedOrigins = [appConfig?.frontendOrigin, appConfig?.adminOrigin].filter(
    (origin): origin is string => Boolean(origin),
  );

  app.enableCors({
    origin: allowedOrigins,
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
      .setTitle('DropClub Business API')
      .setDescription('Public and admin business endpoints for DropClub.')
      .setVersion(appConfig.serviceVersion)
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
      useGlobalPrefix: false,
    });
  }

  const port = appConfig?.port ?? 4000;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();