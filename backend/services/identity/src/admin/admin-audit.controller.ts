import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PrismaIdentityService } from '../prisma/prisma-identity.service';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminPermissionGuard } from './rbac/admin-permission.guard';
import { RequireAdminPermissions } from './rbac/require-permissions.decorator';
import { PERMISSIONS } from './constants';

@ApiTags('admin-audit')
@Controller('admin/audit')
@UseGuards(AdminSessionGuard, AdminPermissionGuard)
@ApiBearerAuth()
export class AdminAuditController {
  constructor(private readonly prisma: PrismaIdentityService) {}

  @Get('events')
  @RequireAdminPermissions(PERMISSIONS.AUDIT_READ)
  @ApiOperation({ summary: 'Recent immutable admin audit events' })
  listEvents() {
    return this.prisma.adminAuditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        action: true,
        actorAdminId: true,
        targetType: true,
        targetId: true,
        reason: true,
        requestId: true,
        createdAt: true,
      },
    });
  }
}