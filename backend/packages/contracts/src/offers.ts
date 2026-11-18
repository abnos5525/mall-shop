export type OfferStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PublicCategory {
  id: string;
  nameFa: string;
  nameEn: string | null;
  description: string | null;
  sortOrder: number;
}

export interface PublicOfferSummary {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  summary: string;
  merchantName: string;
  imageUrl: string | null;
  priceCurrent: string;
  priceReference: string | null;
  currency: string;
  validUntil: string | null;
  disclosureLabel: string | null;
  publishedAt: string | null;
}

export interface PublicOfferDetail extends PublicOfferSummary {
  description: string | null;
  terms: string | null;
  checkedAt: string | null;
}

export interface CursorPageMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PublicOfferListResponse {
  items: PublicOfferSummary[];
  page: CursorPageMeta;
}

export interface InternalAdminVerification {
  adminUserId: string;
  email: string;
  sessionId: string;
  permissions: string[];
}

export const ADMIN_PERMISSIONS = {
  OFFERS_READ: 'offers.read',
  OFFERS_WRITE: 'offers.write',
  OFFERS_PUBLISH: 'offers.publish',
  CATEGORIES_WRITE: 'categories.write',
} as const;