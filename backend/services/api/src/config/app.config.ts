import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  port: number;
  swaggerEnabled: boolean;
  frontendOrigin: string;
  adminOrigin: string;
  identityServiceUrl: string;
  redisUrl: string;
  serviceName: string;
  serviceVersion: string;
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.API_PORT ?? 4000),
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    adminOrigin: process.env.ADMIN_ORIGIN ?? 'http://localhost:3001',
    identityServiceUrl: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:4100',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    serviceName: 'dropclub-api',
    serviceVersion: process.env.npm_package_version ?? '0.1.0',
  }),
);