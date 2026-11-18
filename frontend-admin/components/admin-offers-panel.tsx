'use client';

import { useEffect, useState } from 'react';
import {
  createAdminOffer,
  listAdminOffers,
  publishAdminOffer,
  type AdminOfferRow,
} from '@/lib/business-api';

export function AdminOffersPanel() {
  const [offers, setOffers] = useState<AdminOfferRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [priceCurrent, setPriceCurrent] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('https://');

  const token =
    typeof window !== 'undefined' ? sessionStorage.getItem('dc_admin_access') : null;

  async function reload() {
    if (!token) {
      setError('Not signed in');
      return;
    }
    setError(null);
    try {
      const data = await listAdminOffers(token);
      setOffers(data.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load offers');
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    try {
      await createAdminOffer(token, {
        slug,
        categoryId: 'tech',
        title,
        summary,
        merchantName,
        priceCurrent,
        destinationUrl,
        disclosureLabel: 'نمونه — وضعیت وابسته در صورت تأیید نمایش داده می‌شود',
      });
      setSlug('');
      setTitle('');
      setSummary('');
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Create failed');
    }
  }

  async function onPublish(id: string) {
    if (!token) return;
    try {
      await publishAdminOffer(token, id);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Publish failed');
    }
  }

  if (!token) {
    return null;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">مدیریت پیشنهادها</h2>
      <form onSubmit={(e) => void onCreate(e)} className="grid gap-3 text-sm md:grid-cols-2">
        <label className="space-y-1">
          <span>Slug (en)</span>
          <input className="w-full rounded border px-2 py-1" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <label className="space-y-1">
          <span>Title</span>
          <input className="w-full rounded border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span>Summary</span>
          <textarea className="w-full rounded border px-2 py-1" value={summary} onChange={(e) => setSummary(e.target.value)} required />
        </label>
        <label className="space-y-1">
          <span>Merchant</span>
          <input className="w-full rounded border px-2 py-1" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} required />
        </label>
        <label className="space-y-1">
          <span>Price</span>
          <input className="w-full rounded border px-2 py-1" value={priceCurrent} onChange={(e) => setPriceCurrent(e.target.value)} required />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span>Destination URL</span>
          <input className="w-full rounded border px-2 py-1" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} required />
        </label>
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white md:col-span-2">
          Create draft (category: tech)
        </button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2 text-sm">
        {offers.map((offer) => (
          <li key={offer.id} className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2">
            <div>
              <p className="font-medium">{offer.title}</p>
              <p className="text-xs text-[color:var(--color-muted)]">
                {offer.slug} · {offer.status}
              </p>
            </div>
            {offer.status !== 'PUBLISHED' ? (
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs"
                onClick={() => void onPublish(offer.id)}
              >
                Publish
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}