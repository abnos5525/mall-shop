import { plainToInstance, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  WORKER_PORT!: number;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;
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