'use client';

import { Button } from '@/components/ui/button';

function goUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  return `${base}/go/${encodeURIComponent(slug)}`;
}

type Props = {
  slug: string;
  usesAffiliateDestination: boolean;
};

export function OutboundOfferLink({ slug, usesAffiliateDestination }: Props) {
  return (
    <div className="space-y-2">
      <Button asChild className="w-full">
        <a href={goUrl(slug)} target="_blank" rel="noopener noreferrer">
          رفتن به فروشنده
        </a>
      </Button>
      <p className="text-xs text-muted">
        {usesAffiliateDestination
          ? 'این لینک از مسیر ردیابی ما عبور می‌کند و ممکن است وابسته باشد؛ کلیک به‌معنای خرید یا کمیسیون نیست.'
          : 'این لینک از مسیر ردیابی ما عبور می‌کند؛ کلیک به‌معنای خرید تأییدشده نیست.'}
      </p>
    </div>
  );
}