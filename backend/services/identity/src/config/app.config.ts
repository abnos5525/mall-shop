import { registerAs } from '@nestjs/config';

export type AppConfig = {
  nodeEnv: string;
  port: number;
  swaggerEnabled: boolean;
  serviceName: string;
  serviceVersion: string;
  telegramBotToken?: string;
  telegramInitDataMaxAgeSeconds: number;
  sessionAccessTtlSeconds: number;
  sessionRefreshTtlSeconds: number;
  frontendOrigin: string;
  cookieSecure: boolean;
  internalServiceSecret?: string;
  redisUrl: string;
  sessionSecret: string;
  adminOrigin: string;
  adminSessionAccessTtlSeconds: number;
  adminSessionRefreshTtlSeconds: number;
  webauthnRpId: string;
  webauthnOrigin: string;
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.IDENTITY_PORT ?? 4100),
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    serviceName: 'dropclub-identity',
    serviceVersion: process.env.npm_package_version ?? '0.1.0',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramInitDataMaxAgeSeconds: Number(process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS ?? 300),
    sessionAccessTtlSeconds: Number(process.env.SESSION_ACCESS_TTL_SECONDS ?? 900),
    sessionRefreshTtlSeconds: Number(process.env.SESSION_REFRESH_TTL_SECONDS ?? 2_592_000),
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    internalServiceSecret: process.env.INTERNAL_SERVICE_SECRET,
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-only-change-me-32-characters-min',
    adminOrigin: process.env.ADMIN_ORIGIN ?? 'http://localhost:3001',
    adminSessionAccessTtlSeconds: Number(process.env.ADMIN_SESSION_ACCESS_TTL_SECONDS ?? 900),
    adminSessionRefreshTtlSeconds: Number(process.env.ADMIN_SESSION_REFRESH_TTL_SECONDS ?? 86_400),
    webauthnRpId: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    webauthnOrigin: process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3001',
  }),
);