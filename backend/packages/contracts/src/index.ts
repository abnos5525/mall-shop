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

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface PublicUserProfile {
  subjectId: string;
  status: UserStatus;
  telegramUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
}

export interface AuthSessionResponse {
  user: PublicUserProfile;
  accessToken: string;
  accessTokenExpiresAt: string;
  sessionId: string;
}

export interface InternalSessionVerification {
  subjectId: string;
  status: UserStatus;
  sessionId: string;
}