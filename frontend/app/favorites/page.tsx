'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FavoriteListItem } from '@mall-shop/contracts';
import { OfferCard } from '@/components/offer-card';
import { fetchFavorites } from '@/lib/api/engagement';
import { readUserAccessToken } from '@/lib/user-access';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = readUserAccessToken();
    if (!token) {
      setError('ورود تلگرام لازم است.');
      return;
    }
    void fetchFavorites(token)
      .then((data) => setItems(data.items))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'خطا'));
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-accent">
          ← خانه
        </Link>
        <h1 className="text-2xl font-semibold">علاقه‌مندی‌ها</h1>
      </header>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.offerId}>
            <OfferCard offer={item.offer} />
          </li>
        ))}
      </ul>
      {items.length === 0 && !error ? <p className="text-sm text-muted">هنوز موردی ذخیره نشده است.</p> : null}
    </main>
  );
}