import type { HealthResponse } from '@mall-shop/contracts';

const defaultBase = 'http://localhost:4000/api/v1';

export async function fetchApiHealth(): Promise<HealthResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBase;
  const response = await fetch(`${base}/health`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`health request failed (${response.status})`);
  }

  return (await response.json()) as HealthResponse;
}