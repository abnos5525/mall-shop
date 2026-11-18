const defaultBase = 'http://localhost:4000/api/v1';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBase;
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export type AdminOfferRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  categoryId: string;
  merchantName: string;
  updatedAt: string;
};

export async function listAdminOffers(accessToken: string): Promise<{ items: AdminOfferRow[] }> {
  const response = await fetch(`${apiBase()}/admin/offers?limit=50`, {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error(`list offers failed (${response.status})`);
  }
  return (await response.json()) as { items: AdminOfferRow[] };
}

export async function createAdminOffer(
  accessToken: string,
  body: Record<string, unknown>,
): Promise<AdminOfferRow> {
  const response = await fetch(`${apiBase()}/admin/offers`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`create offer failed (${response.status})`);
  }
  return (await response.json()) as AdminOfferRow;
}

export type AdminDemandRow = {
  id: string;
  subjectId: string;
  categoryId: string;
  description: string;
  status: string;
};

export async function listDemandRequests(accessToken: string): Promise<{ items: AdminDemandRow[] }> {
  const response = await fetch(`${apiBase()}/admin/demand-requests?limit=30`, {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error(`demand list failed (${response.status})`);
  }
  return (await response.json()) as { items: AdminDemandRow[] };
}

export async function moderateDemandRequest(accessToken: string, id: string, status: string) {
  const response = await fetch(`${apiBase()}/admin/demand-requests/${id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`moderate failed (${response.status})`);
  }
}

export async function fetchOfferAnalytics(accessToken: string, offerId: string) {
  const response = await fetch(`${apiBase()}/admin/affiliate/analytics/offers/${offerId}`, {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error(`analytics failed (${response.status})`);
  }
  return response.json();
}

export async function publishAdminOffer(accessToken: string, id: string): Promise<void> {
  const response = await fetch(`${apiBase()}/admin/offers/${id}/publish`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error(`publish failed (${response.status})`);
  }
}