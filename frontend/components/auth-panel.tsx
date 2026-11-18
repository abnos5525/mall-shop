'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AuthSessionResponse } from '@mall-shop/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchBusinessMe, fetchCurrentUser, loginWithTelegramInitData } from '@/lib/identity/client';
import { writeUserAccessToken } from '@/lib/user-access';
import { useTelegramWebApp } from '@/components/telegram/telegram-web-app-bridge';

export function AuthPanel() {
  const bridge = useTelegramWebApp();
  const [session, setSession] = useState<AuthSessionResponse | null>(null);
  const [businessSubject, setBusinessSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canLogin = bridge.status === 'ready';

  const displayName = useMemo(() => {
    if (!session) {
      return null;
    }
    return session.user.firstName ?? session.user.username ?? session.user.telegramUserId;
  }, [session]);

  const handleLogin = useCallback(async () => {
    if (bridge.status !== 'ready') {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await loginWithTelegramInitData(bridge.initData);
      writeUserAccessToken(result.accessToken);
      await fetchCurrentUser(result.accessToken);
      const business = (await fetchBusinessMe(result.accessToken)) as { subjectId?: string };
      setSession(result);
      setBusinessSubject(business.subjectId ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ورود ناموفق بود');
    } finally {
      setPending(false);
    }
  }, [bridge]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ورود تلگرام</CardTitle>
        <CardDescription>فقط raw initData به سرویس Identity ارسال می‌شود.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {bridge.status === 'loading' ? (
          <p className="text-muted">در حال بررسی محیط تلگرام…</p>
        ) : null}
        {bridge.status === 'browser' || bridge.status === 'unsupported' ? (
          <p className="rounded-xl border border-border bg-background px-3 py-2 text-muted">{bridge.message}</p>
        ) : null}

        {session ? (
          <div className="rounded-xl border border-border bg-background px-3 py-3 space-y-1">
            <p>
              وارد شده: <span className="font-medium">{displayName}</span>
            </p>
            <p className="text-muted">subjectId: {session.user.subjectId}</p>
            {businessSubject ? (
              <p className="text-muted">Business API /me: {businessSubject}</p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800">{error}</p>
        ) : null}

        <Button className="w-full" disabled={!canLogin || pending} onClick={() => void handleLogin()}>
          {pending ? 'در حال ورود…' : 'ورود با تلگرام'}
        </Button>
      </CardContent>
    </Card>
  );
}