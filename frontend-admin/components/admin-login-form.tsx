'use client';

import { useState } from 'react';
import { adminLogin } from '@/lib/admin-api';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const result = await adminLogin({
        email,
        password,
        totpCode: totpCode || undefined,
      });
      sessionStorage.setItem('dc_admin_access', result.accessToken);
      setMessage(`Signed in as ${result.email} (${result.permissions.length} permissions)`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Login failed');
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-md space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">DropClub Admin</h1>
      <p className="text-sm text-[color:var(--color-muted)]">Separate admin session · TOTP required after bootstrap</p>
      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input className="w-full rounded-lg border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input className="w-full rounded-lg border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span>TOTP code</span>
        <input className="w-full rounded-lg border px-3 py-2" inputMode="numeric" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
      </label>
      <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white">
        Sign in
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}