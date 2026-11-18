'use client';

import { useEffect, useState } from 'react';
import {
  listDemandRequests,
  moderateDemandRequest,
  type AdminDemandRow,
} from '@/lib/business-api';

export function AdminDemandPanel() {
  const token =
    typeof window !== 'undefined' ? sessionStorage.getItem('dc_admin_access') : null;
  const [rows, setRows] = useState<AdminDemandRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!token) return;
    try {
      const data = await listDemandRequests(token);
      setRows(data.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Load failed');
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function markReviewed(id: string) {
    if (!token) return;
    await moderateDemandRequest(token, id, 'REVIEWED');
    await reload();
  }

  if (!token) return null;

  return (
    <section className="mx-auto max-w-2xl space-y-3 rounded-2xl border bg-white p-6 text-sm shadow-sm">
      <h2 className="text-xl font-semibold">درخواست‌های «می‌خواهم»</h2>
      {error ? <p className="text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded border px-3 py-2">
            <p className="font-medium">{row.description}</p>
            <p className="text-xs text-muted">
              {row.categoryId} · {row.status} · subject {row.subjectId.slice(0, 8)}…
            </p>
            {row.status === 'PENDING' ? (
              <button type="button" className="mt-2 text-xs underline" onClick={() => void markReviewed(row.id)}>
                Mark reviewed
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}