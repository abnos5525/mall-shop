import Link from 'next/link';
import type { PublicOfferSummary } from '@mall-shop/contracts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatPrice(amount: string, currency: string): string {
  if (currency === 'IRR') {
    return `${Number(amount).toLocaleString('fa-IR')} ریال`;
  }
  return `${amount} ${currency}`;
}

export function OfferCard({ offer }: { offer: PublicOfferSummary }) {
  return (
    <Link href={`/offers/${offer.slug}`} className="block">
      <Card className="transition hover:border-accent">
        <CardHeader>
          <CardTitle className="text-lg">{offer.title}</CardTitle>
          <CardDescription>{offer.merchantName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted line-clamp-2">{offer.summary}</p>
          <p className="font-semibold text-accent">{formatPrice(offer.priceCurrent, offer.currency)}</p>
          {offer.disclosureLabel ? (
            <p className="text-xs text-muted">{offer.disclosureLabel}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}