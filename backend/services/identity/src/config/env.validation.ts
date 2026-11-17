import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  IDENTITY_PORT!: number;

  @IsString()
  @IsNotEmpty()
  IDENTITY_DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_ORIGIN!: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(86_400)
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS?: number;

  @IsOptional()
  @IsString()
  @MinLength(32)
  SESSION_SECRET?: string;

  @IsOptional()
  @IsString()
  @MinLength(16)
  INTERNAL_SERVICE_SECRET?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  SESSION_ACCESS_TTL_SECONDS?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3_600)
  SESSION_REFRESH_TTL_SECONDS?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  COOKIE_SECURE?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  SWAGGER_ENABLED?: boolean;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false, whitelist: true });
  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.toString()}`);
  }
  return validated;
}