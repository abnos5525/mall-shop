import type { PublicOfferSummary } from './offers';

export interface FavoriteListItem {
  offerId: string;
  createdAt: string;
  offer: PublicOfferSummary;
}

export interface FavoriteListResponse {
  items: FavoriteListItem[];
}

export type DemandRequestStatus = 'PENDING' | 'REVIEWED' | 'CLOSED' | 'REJECTED';

export interface DemandRequestCreated {
  id: string;
  status: DemandRequestStatus;
  createdAt: string;
}

export const ADMIN_PERMISSIONS_DEMAND = {
  DEMAND_READ: 'demand.read',
  DEMAND_MODERATE: 'demand.moderate',
} as const;