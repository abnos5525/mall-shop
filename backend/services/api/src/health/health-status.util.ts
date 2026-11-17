import type { HealthStatus, ServiceHealthCheck } from '@mall-shop/contracts';

export function aggregateHealthStatus(checks: ServiceHealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === 'error')) {
    return 'error';
  }
  if (checks.some((check) => check.status === 'degraded')) {
    return 'degraded';
  }
  return 'ok';
}