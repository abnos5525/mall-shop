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
  API_PORT!: number;

  @IsString()
  @IsNotEmpty()
  BUSINESS_DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsUrl({ require_tld: false })
  IDENTITY_SERVICE_URL!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_ORIGIN!: string;

  @IsUrl({ require_tld: false })
  ADMIN_ORIGIN!: string;

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