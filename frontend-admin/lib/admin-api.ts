const base = process.env.NEXT_PUBLIC_IDENTITY_BASE_URL ?? 'http://localhost:4100/api/v1';

export type AdminLoginResponse = {
  email: string;
  displayName: string | null;
  permissions: string[];
  accessToken: string;
  expiresAt: string;
  sessionId: string;
};

export async function adminLogin(body: {
  email: string;
  password: string;
  totpCode?: string;
  recoveryCode?: string;
}): Promise<AdminLoginResponse> {
  const response = await fetch(`${base}/admin/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`login failed (${response.status})`);
  }
  return (await response.json()) as AdminLoginResponse;
}

export async function adminMe(accessToken: string) {
  const response = await fetch(`${base}/admin/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('not authenticated');
  }
  return response.json();
}