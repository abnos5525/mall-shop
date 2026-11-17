import { createHmac, timingSafeEqual } from 'node:crypto';

export type TelegramWebAppUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
};

export type VerifiedInitData = {
  authDate: number;
  user: TelegramWebAppUser;
  queryId?: string;
};

export type InitDataValidationError =
  | 'EMPTY'
  | 'MISSING_HASH'
  | 'INVALID_FORMAT'
  | 'INVALID_SIGNATURE'
  | 'STALE_AUTH_DATE'
  | 'MISSING_USER';

export type InitDataValidationResult =
  | { ok: true; data: VerifiedInitData }
  | { ok: false; error: InitDataValidationError };

export function parseInitData(
  rawInitData: string,
  botToken: string,
  maxAgeSeconds: number,
  nowUnix: number = Math.floor(Date.now() / 1000),
): InitDataValidationResult {
  const trimmed = rawInitData.trim();
  if (!trimmed) {
    return { ok: false, error: 'EMPTY' };
  }

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(trimmed);
  } catch {
    return { ok: false, error: 'INVALID_FORMAT' };
  }

  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, error: 'MISSING_HASH' };
  }
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const provided = Buffer.from(hash, 'hex');
  const expected = Buffer.from(calculatedHash, 'hex');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, error: 'INVALID_SIGNATURE' };
  }

  const authDateRaw = params.get('auth_date');
  const authDate = authDateRaw ? Number.parseInt(authDateRaw, 10) : Number.NaN;
  if (!Number.isFinite(authDate)) {
    return { ok: false, error: 'INVALID_FORMAT' };
  }
  if (nowUnix - authDate > maxAgeSeconds || authDate > nowUnix + 60) {
    return { ok: false, error: 'STALE_AUTH_DATE' };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { ok: false, error: 'MISSING_USER' };
  }

  let user: TelegramWebAppUser;
  try {
    const parsed = JSON.parse(userRaw) as TelegramWebAppUser;
    if (typeof parsed.id !== 'number') {
      return { ok: false, error: 'INVALID_FORMAT' };
    }
    user = parsed;
  } catch {
    return { ok: false, error: 'INVALID_FORMAT' };
  }

  const queryId = params.get('query_id') ?? undefined;

  return {
    ok: true,
    data: { authDate, user, queryId },
  };
}

export function initDataReplayKey(rawInitData: string): string {
  const params = new URLSearchParams(rawInitData.trim());
  const hash = params.get('hash') ?? '';
  const authDate = params.get('auth_date') ?? '';
  return `tg:init:${authDate}:${hash}`;
}