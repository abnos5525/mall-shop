import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOfferBySlug } from '@/lib/api/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OutboundOfferLink } from '@/components/outbound-offer-link';
import { FavoriteOfferButton } from '@/components/favorite-offer-button';
import { DemandRequestForm } from '@/components/demand-request-form';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OfferDetailPage({ params }: Props) {
  const { slug } = await params;
  let offer: Awaited<ReturnType<typeof fetchOfferBySlug>> | null = null;
  try {
    offer = await fetchOfferBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <Link href="/offers" className="text-sm text-accent">
        ← همه پیشنهادها
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-snug">{offer.title}</CardTitle>
          <p className="text-sm text-muted">{offer.merchantName}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>{offer.summary}</p>
          {offer.description ? <p className="text-muted">{offer.description}</p> : null}
          <p className="text-lg font-semibold text-accent">
            {Number(offer.priceCurrent).toLocaleString('fa-IR')} ریال
          </p>
          {offer.disclosureLabel ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {offer.disclosureLabel}
            </p>
          ) : null}
          {offer.terms ? <p className="text-xs text-muted">شرایط: {offer.terms}</p> : null}
          <FavoriteOfferButton offerId={offer.id} />
          <OutboundOfferLink
            slug={offer.slug}
            usesAffiliateDestination={offer.usesAffiliateDestination}
          />
          <DemandRequestForm categoryId={offer.categoryId} relatedOfferId={offer.id} />
        </CardContent>
      </Card>
    </main>
  );
}