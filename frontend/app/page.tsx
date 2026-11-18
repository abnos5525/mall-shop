import Link from 'next/link';
import { ApiHealthPanel } from '@/components/api-health-panel';
import { AuthPanel } from '@/components/auth-panel';
import { OfferCard } from '@/components/offer-card';
import type { PublicOfferSummary } from '@mall-shop/contracts';
import { fetchOffers } from '@/lib/api/catalog';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof fetchOffers>> | null = null;
  try {
    featured = await fetchOffers({ limit: 6 });
  } catch {
    featured = null;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="space-y-2">
        <p className="text-sm text-muted">DropClub · فاز ۴</p>
        <h1 className="text-2xl font-semibold leading-tight">باشگاه پیشنهادهای منتخب</h1>
        <p className="text-sm text-muted">
          مرور دسته‌ها و پیشنهادهای منتشرشده از Business API. ورود تلگرام و لینک وابسته در فازهای
          مجزا تکمیل می‌شود.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/categories">
            <Button type="button" variant="outline" className="text-sm">
              دسته‌بندی‌ها
            </Button>
          </Link>
          <Link href="/offers">
            <Button type="button" variant="outline" className="text-sm">
              همه پیشنهادها
            </Button>
          </Link>
          <Link href="/favorites">
            <Button type="button" variant="outline" className="text-sm">
              علاقه‌مندی‌ها
            </Button>
          </Link>
        </div>
      </header>

      {featured && featured.items.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">جدیدترین پیشنهادها</h2>
          <ul className="flex flex-col gap-3">
            {featured.items.map((offer: PublicOfferSummary) => (
              <li key={offer.id}>
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AuthPanel />
      <ApiHealthPanel />

      <footer className="text-center text-xs text-muted">
        لینک‌های وابسته در فاز ۵ با برچسب شفاف نمایش داده می‌شوند.
      </footer>
    </main>
  );
}