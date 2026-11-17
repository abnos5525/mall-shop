import { createHmac } from 'node:crypto';
import { parseInitData } from './telegram-init-data';

function buildSignedInitData(
  botToken: string,
  authDate: number,
  user: Record<string, unknown>,
): string {
  const userJson = JSON.stringify(user);
  const params = new URLSearchParams({
    auth_date: String(authDate),
    user: userJson,
  });
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

describe('parseInitData', () => {
  const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
  const now = 1_700_000_000;
  const user = { id: 42, first_name: 'Test', username: 'dropclub_user' };

  it('accepts a valid signature and fresh auth_date', () => {
    const initData = buildSignedInitData(botToken, now, user);
    const result = parseInitData(initData, botToken, 300, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.user.id).toBe(42);
    }
  });

  it('rejects tampered hash', () => {
    const initData = buildSignedInitData(botToken, now, user).replace(/.$/, '0');
    const result = parseInitData(initData, botToken, 300, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_SIGNATURE');
    }
  });

  it('rejects stale auth_date', () => {
    const stale = now - 400;
    const initData = buildSignedInitData(botToken, stale, user);
    const result = parseInitData(initData, botToken, 300, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('STALE_AUTH_DATE');
    }
  });

  it('rejects empty initData', () => {
    const result = parseInitData('   ', botToken, 300, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('EMPTY');
    }
  });
});