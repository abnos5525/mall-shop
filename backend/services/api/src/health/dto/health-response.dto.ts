import { ApiProperty } from '@nestjs/swagger';

export class ServiceHealthCheckDto {
  @ApiProperty({ example: 'business-database' })
  name!: string;

  @ApiProperty({ enum: ['ok', 'degraded', 'error'] })
  status!: 'ok' | 'degraded' | 'error';

  @ApiProperty({ required: false, example: 3 })
  latencyMs?: number;

  @ApiProperty({ required: false })
  message?: string;
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok', 'degraded', 'error'] })
  status!: 'ok' | 'degraded' | 'error';

  @ApiProperty({ example: 'dropclub-api' })
  service!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ type: [ServiceHealthCheckDto] })
  checks!: ServiceHealthCheckDto[];
}