import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ADMIN_PERMISSIONS } from '@mall-shop/contracts';
import type { IdentityClientService } from '../identity/identity-client.service';
import { AdminBearerGuard, type AdminVerifiedRequest } from '../identity/guards/admin-bearer.guard';
import { AdminPermissionGuard } from '../identity/guards/admin-permission.guard';
import { RequireAdminPermissions } from '../identity/decorators/require-admin-permissions.decorator';
import type { OffersService } from './offers.service';
import type { CreateOfferDto } from './dto/create-offer.dto';
import type { UpdateOfferDto } from './dto/update-offer.dto';
import type { ListOffersQueryDto } from './dto/list-offers-query.dto';

@ApiTags('admin-offers')
@ApiBearerAuth()
@Controller('admin/offers')
@UseGuards(AdminBearerGuard, AdminPermissionGuard)
export class AdminOffersController {
  constructor(
    private readonly offers: OffersService,
    private readonly identityClient: IdentityClientService,
  ) {}

  @Get()
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'List offers including drafts (admin)' })
  list(@Query() query: ListOffersQueryDto) {
    return this.offers.listAdminOffers(query);
  }

  @Get(':id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'Get offer by id (admin)' })
  get(@Param('id') id: string) {
    return this.offers.getAdminOffer(id);
  }

  @Post()
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_WRITE)
  @ApiOperation({ summary: 'Create draft offer' })
  async create(@Req() request: AdminVerifiedRequest, @Body() body: CreateOfferDto) {
    const offer = await this.offers.createOffer(request.adminAuth!.adminUserId, body);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'offer.created',
      targetType: 'offer',
      targetId: offer.id,
      requestId: typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : undefined,
    });
    return offer;
  }

  @Patch(':id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_WRITE)
  @ApiOperation({ summary: 'Update offer' })
  async update(
    @Req() request: AdminVerifiedRequest,
    @Param('id') id: string,
    @Body() body: UpdateOfferDto,
  ) {
    const offer = await this.offers.updateOffer(request.adminAuth!.adminUserId, id, body);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'offer.updated',
      targetType: 'offer',
      targetId: offer.id,
    });
    return offer;
  }

  @Post(':id/publish')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_PUBLISH)
  @ApiOperation({ summary: 'Publish offer' })
  async publish(@Req() request: AdminVerifiedRequest, @Param('id') id: string) {
    const offer = await this.offers.publishOffer(request.adminAuth!.adminUserId, id);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'offer.published',
      targetType: 'offer',
      targetId: offer.id,
    });
    return offer;
  }

  @Post(':id/archive')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_PUBLISH)
  @ApiOperation({ summary: 'Archive offer' })
  async archive(@Req() request: AdminVerifiedRequest, @Param('id') id: string) {
    const offer = await this.offers.archiveOffer(request.adminAuth!.adminUserId, id);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'offer.archived',
      targetType: 'offer',
      targetId: offer.id,
    });
    return offer;
  }
}