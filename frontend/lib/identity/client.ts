import type { AuthSessionResponse, PublicUserProfile } from '@mall-shop/contracts';

const identityBase = process.env.NEXT_PUBLIC_IDENTITY_BASE_URL ?? 'http://localhost:4100/api/v1';

export async function loginWithTelegramInitData(initData: string): Promise<AuthSessionResponse> {
  const response = await fetch(`${identityBase}/auth/telegram`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ initData }),
  });
  if (!response.ok) {
    throw new Error(`telegram auth failed (${response.status})`);
  }
  return (await response.json()) as AuthSessionResponse;
}

export async function fetchCurrentUser(accessToken: string): Promise<PublicUserProfile> {
  const response = await fetch(`${identityBase}/auth/me`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`auth me failed (${response.status})`);
  }
  return (await response.json()) as PublicUserProfile;
}

export async function fetchBusinessMe(accessToken: string) {
  const businessBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const response = await fetch(`${businessBase}/me`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`business me failed (${response.status})`);
  }
  return response.json();
}