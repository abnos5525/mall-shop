import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  port: number;
  swaggerEnabled: boolean;
  serviceName: string;
  serviceVersion: string;
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.IDENTITY_PORT ?? 4100),
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    serviceName: 'dropclub-identity',
    serviceVersion: process.env.npm_package_version ?? '0.1.0',
  }),
);