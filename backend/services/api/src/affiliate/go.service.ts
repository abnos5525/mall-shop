import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type OutboundDestinationKind } from '@mall-shop/database/business';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import { assertHttpOrHttpsUrl } from '../common/url.util';
import { hashVisitor } from './visitor-hash.util';

export type GoResolution = {
  redirectUrl: string;
  destinationKind: OutboundDestinationKind;
  offerId: string;
  offerSlug: string;
  recorded: boolean;
};

export type GoContext = {
  ip?: string;
  userAgent?: string;
  subjectId?: string;
  idempotencyKey?: string;
  hashPepper: string;
};

@Injectable()
export class GoService {
  constructor(private readonly prisma: PrismaBusinessService) {}

  async resolveRedirect(slug: string, context: GoContext): Promise<GoResolution> {
    const offer = await this.loadPublishedOffer(slug);
    const affiliatePreferred = Boolean(offer.affiliateUrl);
    const rawUrl = affiliatePreferred ? offer.affiliateUrl! : offer.destinationUrl;
    const redirectUrl = assertHttpOrHttpsUrl(rawUrl, 'redirect');
    const destinationKind: OutboundDestinationKind = affiliatePreferred ? 'AFFILIATE' : 'DIRECT';
    const redirectHost = new URL(redirectUrl).hostname;

    if (context.idempotencyKey) {
      const existing = await this.prisma.outboundClick.findUnique({
        where: { idempotencyKey: context.idempotencyKey },
      });
      if (existing && existing.offerId === offer.id) {
        return {
          redirectUrl,
          destinationKind,
          offerId: offer.id,
          offerSlug: offer.slug,
          recorded: false,
        };
      }
    }

    try {
      await this.prisma.outboundClick.create({
        data: {
          offerId: offer.id,
          offerSlug: offer.slug,
          destinationKind,
          redirectHost,
          visitorHash: hashVisitor(context.ip, context.userAgent, context.hashPepper),
          subjectId: context.subjectId,
          idempotencyKey: context.idempotencyKey,
        },
      });
    } catch (error) {
      if (
        context.idempotencyKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          redirectUrl,
          destinationKind,
          offerId: offer.id,
          offerSlug: offer.slug,
          recorded: false,
        };
      }
      throw error;
    }

    return {
      redirectUrl,
      destinationKind,
      offerId: offer.id,
      offerSlug: offer.slug,
      recorded: true,
    };
  }

  private async loadPublishedOffer(slug: string) {
    const now = new Date();
    const offer = await this.prisma.offer.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }
}