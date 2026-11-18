'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitDemandRequest } from '@/lib/api/engagement';
import { readUserAccessToken } from '@/lib/user-access';

type Props = {
  categoryId: string;
  relatedOfferId?: string;
};

export function DemandRequestForm({ categoryId, relatedOfferId }: Props) {
  const [description, setDescription] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const token = readUserAccessToken();
    if (!token) {
      setError('ورود تلگرام لازم است.');
      return;
    }
  if (!consent) {
    setError('برای ارسال باید رضایت صریح بدهید.');
    return;
  }
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const created = await submitDemandRequest(token, {
        categoryId,
        relatedOfferId,
        description,
        budgetAmount: budgetAmount || undefined,
        consent: true,
      });
      setMessage(`درخواست ثبت شد (${created.id.slice(0, 8)}…)`);
      setDescription('');
      setBudgetAmount('');
      setConsent(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ارسال ناموفق');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
      <h3 className="font-semibold">می‌خواهم این را</h3>
      <p className="text-xs text-muted">دادهٔ حداقلی — فقط با رضایت شما برای پیگیری داخلی ذخیره می‌شود.</p>
      <textarea
        className="w-full rounded-lg border border-border px-3 py-2"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="چه محصول یا سرویسی می‌خواهید؟"
        required
        maxLength={2000}
      />
      <input
        className="w-full rounded-lg border border-border px-3 py-2"
        inputMode="numeric"
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        placeholder="بودجه تقریبی (ریال، اختیاری)"
      />
      <label className="flex items-start gap-2 text-xs">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>رضایت می‌دهم این درخواست برای بررسی تیم DropClub ذخیره شود و در صورت نیاز با من تماس گرفته شود.</span>
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'در حال ارسال…' : 'ارسال درخواست'}
      </Button>
      {message ? <p className="text-xs text-accent">{message}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </form>
  );
}