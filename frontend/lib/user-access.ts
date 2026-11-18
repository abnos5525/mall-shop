const KEY = 'dc_user_access';

export function readUserAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(KEY);
}

export function writeUserAccessToken(token: string): void {
  sessionStorage.setItem(KEY, token);
}

export function clearUserAccessToken(): void {
  sessionStorage.removeItem(KEY);
}