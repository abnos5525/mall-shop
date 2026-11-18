import type { PublicCategory, PublicOfferDetail, PublicOfferListResponse } from '@mall-shop/contracts';

const defaultBase = 'http://localhost:4000/api/v1';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBase;
}

export async function fetchCategories(): Promise<PublicCategory[]> {
  const response = await fetch(`${apiBase()}/categories`, {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`categories failed (${response.status})`);
  }
  return (await response.json()) as PublicCategory[];
}

export async function fetchOffers(params?: {
  categoryId?: string;
  cursor?: string;
  limit?: number;
}): Promise<PublicOfferListResponse> {
  const search = new URLSearchParams();
  if (params?.categoryId) search.set('categoryId', params.categoryId);
  if (params?.cursor) search.set('cursor', params.cursor);
  if (params?.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  const response = await fetch(`${apiBase()}/offers${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`offers failed (${response.status})`);
  }
  return (await response.json()) as PublicOfferListResponse;
}

export async function fetchOfferBySlug(slug: string): Promise<PublicOfferDetail> {
  const response = await fetch(`${apiBase()}/offers/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`offer failed (${response.status})`);
  }
  return (await response.json()) as PublicOfferDetail;
}