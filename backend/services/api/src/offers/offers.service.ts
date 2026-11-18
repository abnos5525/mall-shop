import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@mall-shop/database/business';
import type { PublicOfferDetail, PublicOfferListResponse } from '@mall-shop/contracts';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import type { PublicReadCacheService } from '../common/cache/public-read-cache.service';
import { assertHttpOrHttpsUrl } from '../common/url.util';
import { toPublicOfferDetail, toPublicOfferSummary } from './mappers/offer.mapper';
import type { CreateOfferDto } from './dto/create-offer.dto';
import type { UpdateOfferDto } from './dto/update-offer.dto';
import type { ListOffersQueryDto } from './dto/list-offers-query.dto';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaBusinessService,
    private readonly cache: PublicReadCacheService,
  ) {}

  async listPublicCategories() {
    const cacheKey = 'categories:active';
    const cached = this.cache.get<Awaited<ReturnType<typeof this.loadActiveCategories>>>(cacheKey);
    if (cached) {
      return cached;
    }
    const rows = await this.loadActiveCategories();
    this.cache.set(cacheKey, rows);
    return rows;
  }

  private async loadActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { nameFa: 'asc' }],
      select: {
        id: true,
        nameFa: true,
        nameEn: true,
        description: true,
        sortOrder: true,
      },
    });
  }

  async listPublicOffers(query: ListOffersQueryDto): Promise<PublicOfferListResponse> {
    const limit = query.limit ?? 20;
    const cacheKey = `offers:list:${query.categoryId ?? 'all'}:${query.cursor ?? ''}:${limit}`;
    const cached = this.cache.get<PublicOfferListResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const where: Prisma.OfferWhereInput = {
      status: 'PUBLISHED',
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };

    const rows = await this.prisma.offer.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const response: PublicOfferListResponse = {
      items: items.map(toPublicOfferSummary),
      page: {
        nextCursor: hasMore ? items[items.length - 1]!.id : null,
        hasMore,
      },
    };
    this.cache.set(cacheKey, response);
    return response;
  }

  async getPublicOfferBySlug(slug: string): Promise<PublicOfferDetail> {
    const cacheKey = `offers:slug:${slug}`;
    const cached = this.cache.get<PublicOfferDetail>(cacheKey);
    if (cached) {
      return cached;
    }

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
    const mapped = toPublicOfferDetail(offer);
    this.cache.set(cacheKey, mapped);
    return mapped;
  }

  async createOffer(adminUserId: string, dto: CreateOfferDto) {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const destinationUrl = assertHttpOrHttpsUrl(dto.destinationUrl, 'destinationUrl');
    const affiliateUrl = dto.affiliateUrl
      ? assertHttpOrHttpsUrl(dto.affiliateUrl, 'affiliateUrl')
      : undefined;
    const imageUrl = dto.imageUrl ? assertHttpOrHttpsUrl(dto.imageUrl, 'imageUrl') : undefined;

    try {
      const created = await this.prisma.offer.create({
        data: {
          slug: dto.slug,
          categoryId: dto.categoryId,
          title: dto.title,
          summary: dto.summary,
          description: dto.description,
          merchantName: dto.merchantName,
          imageUrl,
          priceCurrent: dto.priceCurrent,
          priceReference: dto.priceReference,
          currency: dto.currency ?? 'IRR',
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          terms: dto.terms,
          disclosureLabel: dto.disclosureLabel,
          destinationUrl,
          affiliateUrl,
          createdByAdminId: adminUserId,
          updatedByAdminId: adminUserId,
        },
      });
      this.invalidatePublicOfferCaches(created.slug);
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Offer slug already exists');
      }
      throw error;
    }
  }

  async updateOffer(adminUserId: string, offerId: string, dto: UpdateOfferDto) {
    const existing = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!existing) {
      throw new NotFoundException('Offer not found');
    }

    const destinationUrl = dto.destinationUrl
      ? assertHttpOrHttpsUrl(dto.destinationUrl, 'destinationUrl')
      : undefined;
    const affiliateUrl = dto.affiliateUrl
      ? assertHttpOrHttpsUrl(dto.affiliateUrl, 'affiliateUrl')
      : undefined;
    const imageUrl = dto.imageUrl ? assertHttpOrHttpsUrl(dto.imageUrl, 'imageUrl') : undefined;

    const offer = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        title: dto.title,
        summary: dto.summary,
        description: dto.description,
        merchantName: dto.merchantName,
        imageUrl,
        priceCurrent: dto.priceCurrent,
        priceReference: dto.priceReference,
        currency: dto.currency,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        terms: dto.terms,
        disclosureLabel: dto.disclosureLabel,
        destinationUrl,
        affiliateUrl,
        updatedByAdminId: adminUserId,
      },
    });
    this.invalidatePublicOfferCaches(offer.slug);
    return offer;
  }

  async publishOffer(adminUserId: string, offerId: string) {
    const existing = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!existing) {
      throw new NotFoundException('Offer not found');
    }
    if (existing.status === 'ARCHIVED') {
      throw new ConflictException('Archived offers cannot be published');
    }
    const now = new Date();
    const offer = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'PUBLISHED',
        publishedAt: existing.publishedAt ?? now,
        checkedAt: now,
        updatedByAdminId: adminUserId,
      },
    });
    this.invalidatePublicOfferCaches(offer.slug);
    return offer;
  }

  async archiveOffer(adminUserId: string, offerId: string) {
    const existing = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!existing) {
      throw new NotFoundException('Offer not found');
    }
    const offer = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'ARCHIVED',
        updatedByAdminId: adminUserId,
      },
    });
    this.invalidatePublicOfferCaches(offer.slug);
    return offer;
  }

  async listAdminOffers(query: ListOffersQueryDto) {
    const limit = query.limit ?? 20;
    const where: Prisma.OfferWhereInput = query.categoryId ? { categoryId: query.categoryId } : {};
    const rows = await this.prisma.offer.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items,
      page: { nextCursor: hasMore ? items[items.length - 1]!.id : null, hasMore },
    };
  }

  async getAdminOffer(offerId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async listAdminCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          id: dto.id,
          nameFa: dto.nameFa,
          nameEn: dto.nameEn,
          description: dto.description,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Category id already exists');
      }
      throw error;
    } finally {
      this.cache.invalidatePrefix('categories:');
      this.cache.invalidatePrefix('offers:');
    }
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          nameFa: dto.nameFa,
          nameEn: dto.nameEn,
          description: dto.description,
          sortOrder: dto.sortOrder,
          isActive: dto.isActive,
        },
      });
      this.cache.invalidatePrefix('categories:');
      this.cache.invalidatePrefix('offers:');
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }

  private invalidatePublicOfferCaches(_slug: string): void {
    this.cache.invalidatePrefix('offers:');
  }
}