import type { DemandRequestCreated, FavoriteListResponse } from '@mall-shop/contracts';

const base = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

function authHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchFavorites(token: string): Promise<FavoriteListResponse> {
  const response = await fetch(`${base()}/me/favorites`, { headers: authHeaders(token) });
  if (!response.ok) {
    throw new Error(`favorites failed (${response.status})`);
  }
  return (await response.json()) as FavoriteListResponse;
}

export async function addFavorite(token: string, offerId: string): Promise<void> {
  const response = await fetch(`${base()}/me/favorites/${offerId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`favorite add failed (${response.status})`);
  }
}

export async function removeFavorite(token: string, offerId: string): Promise<void> {
  const response = await fetch(`${base()}/me/favorites/${offerId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`favorite remove failed (${response.status})`);
  }
}

export async function submitDemandRequest(
  token: string,
  body: {
    categoryId: string;
    relatedOfferId?: string;
    description: string;
    budgetAmount?: string;
    consent: boolean;
  },
): Promise<DemandRequestCreated> {
  const response = await fetch(`${base()}/demand-requests`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`demand failed (${response.status})`);
  }
  const json = (await response.json()) as { id: string; status: string; createdAt: string | Date };
  return {
    id: json.id,
    status: json.status as DemandRequestCreated['status'],
    createdAt: typeof json.createdAt === 'string' ? json.createdAt : json.createdAt.toISOString(),
  };
}