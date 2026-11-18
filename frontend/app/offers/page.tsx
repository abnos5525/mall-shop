import Link from 'next/link';
import type { PublicOfferSummary } from '@mall-shop/contracts';
import { fetchOffers } from '@/lib/api/catalog';
import { OfferCard } from '@/components/offer-card';

type Props = {
  searchParams: Promise<{ category?: string; cursor?: string }>;
};

export default async function OffersPage({ searchParams }: Props) {
  const params = await searchParams;
  let error: string | null = null;
  let data: Awaited<ReturnType<typeof fetchOffers>> | null = null;
  try {
    data = await fetchOffers({
      categoryId: params.category,
      cursor: params.cursor,
      limit: 20,
    });
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'خطا';
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-accent">
          ← خانه
        </Link>
        <h1 className="text-2xl font-semibold">پیشنهادها</h1>
        {params.category ? (
          <p className="text-sm text-muted">فیلتر دسته: {params.category}</p>
        ) : null}
      </header>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {data ? (
        <>
          <ul className="flex flex-col gap-4">
            {data.items.map((offer: PublicOfferSummary) => (
              <li key={offer.id}>
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
          {data.page.hasMore && data.page.nextCursor ? (
            <Link
              className="text-center text-sm text-accent"
              href={`/offers?${new URLSearchParams({
                ...(params.category ? { category: params.category } : {}),
                cursor: data.page.nextCursor,
              }).toString()}`}
            >
              پیشنهادهای بیشتر
            </Link>
          ) : null}
        </>
      ) : null}
    </main>
  );
}