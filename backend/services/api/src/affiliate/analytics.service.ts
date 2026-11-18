import { Injectable, NotFoundException } from '@nestjs/common';
import type { OfferClickAnalytics } from '@mall-shop/contracts';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';

@Injectable()
export class AffiliateAnalyticsService {
  constructor(private readonly prisma: PrismaBusinessService) {}

  async getOfferAnalytics(offerId: string): Promise<OfferClickAnalytics> {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId }, select: { id: true, slug: true } });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    const since = new Date(Date.now() - 7 * 86_400_000);

    const [totalClicks, clicksLast7Days, affiliateClicks, directClicks] = await Promise.all([
      this.prisma.outboundClick.count({ where: { offerId } }),
      this.prisma.outboundClick.count({ where: { offerId, createdAt: { gte: since } } }),
      this.prisma.outboundClick.count({ where: { offerId, destinationKind: 'AFFILIATE' } }),
      this.prisma.outboundClick.count({ where: { offerId, destinationKind: 'DIRECT' } }),
    ]);

    return {
      offerId: offer.id,
      offerSlug: offer.slug,
      totalClicks,
      clicksLast7Days,
      affiliateClicks,
      directClicks,
    };
  }

  async listOfferAnalytics(limit = 20) {
    const rows = await this.prisma.offer.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, slug: true, title: true, status: true },
    });
    const stats = await Promise.all(rows.map((row) => this.getOfferAnalytics(row.id)));
    return { items: rows.map((row, index) => ({ ...row, analytics: stats[index]! })) };
  }
}