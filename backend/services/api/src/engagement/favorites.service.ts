import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@mall-shop/database/business';
import type { FavoriteListResponse } from '@mall-shop/contracts';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import { toPublicOfferSummary } from '../offers/mappers/offer.mapper';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaBusinessService) {}

  async list(subjectId: string): Promise<FavoriteListResponse> {
    const rows = await this.prisma.favorite.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
      include: { offer: true },
    });
    return {
      items: rows
      .filter((row) => row.offer.status === 'PUBLISHED')
      .map((row) => ({
        offerId: row.offerId,
        createdAt: row.createdAt.toISOString(),
        offer: toPublicOfferSummary(row.offer),
      })),
    };
  }

  async add(subjectId: string, offerId: string) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, status: 'PUBLISHED' },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    try {
      return await this.prisma.favorite.create({
        data: { subjectId, offerId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Already favorited');
      }
      throw error;
    }
  }

  async remove(subjectId: string, offerId: string) {
    const result = await this.prisma.favorite.deleteMany({
      where: { subjectId, offerId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async isFavorited(subjectId: string, offerId: string): Promise<boolean> {
    const row = await this.prisma.favorite.findUnique({
      where: { subjectId_offerId: { subjectId, offerId } },
    });
    return Boolean(row);
  }
}