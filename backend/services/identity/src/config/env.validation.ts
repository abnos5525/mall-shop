import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
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

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS?: number;

  @IsOptional()
  @IsString()
  SESSION_SECRET?: string;

  @IsOptional()
  @IsString()
  INTERNAL_SERVICE_SECRET?: string;

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