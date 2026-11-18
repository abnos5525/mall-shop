import type { Offer } from '@mall-shop/database/business';
import type { PublicOfferDetail, PublicOfferSummary } from '@mall-shop/contracts';

function decimalToString(value: { toString(): string } | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

export function toPublicOfferSummary(offer: Offer): PublicOfferSummary {
  return {
    id: offer.id,
    slug: offer.slug,
    categoryId: offer.categoryId,
    title: offer.title,
    summary: offer.summary,
    merchantName: offer.merchantName,
    imageUrl: offer.imageUrl,
    priceCurrent: offer.priceCurrent.toString(),
    priceReference: decimalToString(offer.priceReference),
    currency: offer.currency,
    validUntil: offer.validUntil?.toISOString() ?? null,
    disclosureLabel: offer.disclosureLabel,
    publishedAt: offer.publishedAt?.toISOString() ?? null,
  };
}

export function toPublicOfferDetail(offer: Offer): PublicOfferDetail {
  return {
    ...toPublicOfferSummary(offer),
    description: offer.description,
    terms: offer.terms,
    checkedAt: offer.checkedAt?.toISOString() ?? null,
    usesAffiliateDestination: Boolean(offer.affiliateUrl),
  };
}