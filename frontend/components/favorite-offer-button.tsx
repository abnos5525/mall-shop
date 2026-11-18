'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addFavorite, removeFavorite } from '@/lib/api/engagement';
import { readUserAccessToken } from '@/lib/user-access';

type Props = {
  offerId: string;
};

export function FavoriteOfferButton({ offerId }: Props) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const token = readUserAccessToken();
    if (!token) {
      setMessage('ابتدا از پایین با تلگرام وارد شوید.');
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      if (saved) {
        await removeFavorite(token, offerId);
        setSaved(false);
      } else {
        await addFavorite(token, offerId);
        setSaved(true);
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'خطا');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={() => void toggle()}>
        {saved ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      </Button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}