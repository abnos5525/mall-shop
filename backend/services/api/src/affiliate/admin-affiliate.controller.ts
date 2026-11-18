import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ADMIN_PERMISSIONS } from '@mall-shop/contracts';
import { AdminBearerGuard } from '../identity/guards/admin-bearer.guard';
import { AdminPermissionGuard } from '../identity/guards/admin-permission.guard';
import { RequireAdminPermissions } from '../identity/decorators/require-admin-permissions.decorator';
import type { AffiliateAnalyticsService } from './analytics.service';
import type { PrismaBusinessService } from '../prisma/prisma-business.service';
import type { CreatePartnerDto } from './dto/create-partner.dto';
import { assertHttpOrHttpsUrl } from '../common/url.util';

@ApiTags('admin-affiliate')
@ApiBearerAuth()
@Controller('admin/affiliate')
@UseGuards(AdminBearerGuard, AdminPermissionGuard)
export class AdminAffiliateController {
  constructor(
    private readonly analytics: AffiliateAnalyticsService,
    private readonly prisma: PrismaBusinessService,
  ) {}

  @Get('analytics/offers')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'Basic click analytics per offer' })
  listAnalytics() {
    return this.analytics.listOfferAnalytics();
  }

  @Get('analytics/offers/:offerId')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'Click analytics for one offer' })
  offerAnalytics(@Param('offerId') offerId: string) {
    return this.analytics.getOfferAnalytics(offerId);
  }

  @Get('partners')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'List affiliate partners' })
  listPartners() {
    return this.prisma.affiliatePartner.findMany({ orderBy: { displayName: 'asc' } });
  }

  @Post('partners')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_WRITE)
  @ApiOperation({ summary: 'Register affiliate partner metadata' })
  async createPartner(@Body() body: CreatePartnerDto) {
    const websiteUrl = body.websiteUrl ? assertHttpOrHttpsUrl(body.websiteUrl, 'websiteUrl') : undefined;
    return this.prisma.affiliatePartner.create({
      data: {
        id: body.id,
        displayName: body.displayName,
        websiteUrl,
        isActive: body.isActive ?? true,
        notes: body.notes,
      },
    });
  }
}