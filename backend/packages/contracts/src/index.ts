export type HealthStatus = 'ok' | 'degraded' | 'error';

export interface ServiceHealthCheck {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  version: string;
  timestamp: string;
  checks: ServiceHealthCheck[];
}