import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ADMIN_PERMISSIONS } from '@mall-shop/contracts';
import type { IdentityClientService } from '../identity/identity-client.service';
import { AdminBearerGuard, type AdminVerifiedRequest } from '../identity/guards/admin-bearer.guard';
import { AdminPermissionGuard } from '../identity/guards/admin-permission.guard';
import { RequireAdminPermissions } from '../identity/decorators/require-admin-permissions.decorator';
import type { OffersService } from './offers.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('admin-categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(AdminBearerGuard, AdminPermissionGuard)
export class AdminCategoriesController {
  constructor(
    private readonly offers: OffersService,
    private readonly identityClient: IdentityClientService,
  ) {}

  @Get()
  @RequireAdminPermissions(ADMIN_PERMISSIONS.OFFERS_READ)
  @ApiOperation({ summary: 'List all categories (admin)' })
  list() {
    return this.offers.listAdminCategories();
  }

  @Post()
  @RequireAdminPermissions(ADMIN_PERMISSIONS.CATEGORIES_WRITE)
  @ApiOperation({ summary: 'Create category' })
  async create(@Req() request: AdminVerifiedRequest, @Body() body: CreateCategoryDto) {
    const category = await this.offers.createCategory(body);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'category.created',
      targetType: 'category',
      targetId: category.id,
    });
    return category;
  }

  @Patch(':id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.CATEGORIES_WRITE)
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Req() request: AdminVerifiedRequest,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    const category = await this.offers.updateCategory(id, body);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'category.updated',
      targetType: 'category',
      targetId: category.id,
    });
    return category;
  }
}