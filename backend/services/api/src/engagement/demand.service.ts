import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@mall-shop/database/business';
import type { DemandRequestStatus } from '@mall-shop/contracts';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import type { CreateDemandRequestDto } from './dto/create-demand-request.dto';
import type { ModerateDemandRequestDto } from './dto/moderate-demand-request.dto';

const DAILY_DEMAND_LIMIT = 5;

@Injectable()
export class DemandService {
  constructor(private readonly prisma: PrismaBusinessService) {}

  async create(subjectId: string, dto: CreateDemandRequestDto) {
    if (!dto.consent) {
      throw new BadRequestException('Explicit consent is required');
    }

    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, isActive: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.relatedOfferId) {
      const offer = await this.prisma.offer.findFirst({
        where: { id: dto.relatedOfferId, status: 'PUBLISHED' },
      });
      if (!offer) {
        throw new NotFoundException('Related offer not found');
      }
    }

    const since = new Date(Date.now() - 86_400_000);
    const recentCount = await this.prisma.demandRequest.count({
      where: { subjectId, createdAt: { gte: since } },
    });
    if (recentCount >= DAILY_DEMAND_LIMIT) {
      throw new HttpException('Daily demand request limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }

    return this.prisma.demandRequest.create({
      data: {
        subjectId,
        categoryId: dto.categoryId,
        relatedOfferId: dto.relatedOfferId,
        description: dto.description.trim(),
        budgetAmount: dto.budgetAmount,
        budgetCurrency: dto.budgetCurrency ?? 'IRR',
        consentGivenAt: new Date(),
      },
      select: { id: true, status: true, createdAt: true },
    });
  }

  async listMine(subjectId: string) {
    return this.prisma.demandRequest.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        categoryId: true,
        description: true,
        status: true,
        createdAt: true,
        budgetAmount: true,
        budgetCurrency: true,
      },
    });
  }

  async listForAdmin(status?: DemandRequestStatus, cursor?: string, limit = 20) {
    const rows = await this.prisma.demandRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        subjectId: true,
        categoryId: true,
        relatedOfferId: true,
        description: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        reviewedAt: true,
        budgetAmount: true,
        budgetCurrency: true,
      },
    });
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map((item) => ({
        ...item,
        budgetAmount: item.budgetAmount?.toString() ?? null,
        createdAt: item.createdAt.toISOString(),
        reviewedAt: item.reviewedAt?.toISOString() ?? null,
      })),
      page: { nextCursor: hasMore ? items[items.length - 1]!.id : null, hasMore },
    };
  }

  async moderate(id: string, dto: ModerateDemandRequestDto) {
    try {
      return await this.prisma.demandRequest.update({
        where: { id },
        data: {
          status: dto.status,
          adminNotes: dto.adminNotes,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Demand request not found');
      }
      throw error;
    }
  }
}