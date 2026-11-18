import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ADMIN_PERMISSIONS } from '@mall-shop/contracts';
import type { DemandRequestStatus } from '@mall-shop/contracts';
import { AdminBearerGuard, type AdminVerifiedRequest } from '../identity/guards/admin-bearer.guard';
import { AdminPermissionGuard } from '../identity/guards/admin-permission.guard';
import { RequireAdminPermissions } from '../identity/decorators/require-admin-permissions.decorator';
import type { DemandService } from './demand.service';
import type { IdentityClientService } from '../identity/identity-client.service';
import type { ModerateDemandRequestDto } from './dto/moderate-demand-request.dto';

@ApiTags('admin-demand')
@ApiBearerAuth()
@Controller('admin/demand-requests')
@UseGuards(AdminBearerGuard, AdminPermissionGuard)
export class AdminDemandController {
  constructor(
    private readonly demand: DemandService,
    private readonly identityClient: IdentityClientService,
  ) {}

  @Get()
  @RequireAdminPermissions(ADMIN_PERMISSIONS.DEMAND_READ)
  @ApiOperation({ summary: 'List demand requests for moderation' })
  list(
    @Query('status') status?: DemandRequestStatus,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.demand.listForAdmin(status, cursor, limit);
  }

  @Patch(':id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.DEMAND_MODERATE)
  @ApiOperation({ summary: 'Update demand request status / admin notes' })
  async moderate(
    @Req() request: AdminVerifiedRequest,
    @Param('id') id: string,
    @Body() body: ModerateDemandRequestDto,
  ) {
    const row = await this.demand.moderate(id, body);
    await this.identityClient.recordAdminAudit({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'demand.moderated',
      targetType: 'demand_request',
      targetId: id,
      metadata: { status: body.status },
    });
    return row;
  }
}