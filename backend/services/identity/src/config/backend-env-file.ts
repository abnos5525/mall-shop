import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** `backend/.env` when cwd is `backend/services/<service>`. */
export function resolveBackendEnvFile(): string {
  const path = resolve(process.cwd(), '../../.env');
  return existsSync(path) ? path : path;
}