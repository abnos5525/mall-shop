import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PrismaIdentityService } from '../prisma/prisma-identity.service';
import { AdminSessionGuard, type AdminAuthenticatedRequest } from './guards/admin-session.guard';
import { AdminPermissionGuard } from './rbac/admin-permission.guard';
import { RequireAdminPermissions } from './rbac/require-permissions.decorator';
import { PERMISSIONS } from './constants';
import type { AdminSessionService } from './session/admin-session.service';
import type { AdminAuditService } from './audit/audit.service';
import type { RbacService } from './rbac/rbac.service';
import type { GrantSuperAdminDto } from './dto/grant-super-admin.dto';

@ApiTags('admin-access')
@Controller('admin/access')
@UseGuards(AdminSessionGuard, AdminPermissionGuard)
@ApiBearerAuth()
export class AdminAccessController {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly sessions: AdminSessionService,
    private readonly audit: AdminAuditService,
    private readonly rbac: RbacService,
  ) {}

  @Post('super-admin/requests')
  @RequireAdminPermissions(PERMISSIONS.ROLES_GRANT)
  @ApiOperation({ summary: 'Request granting super_admin (dual approval required)' })
  async requestSuperAdmin(@Req() request: AdminAuthenticatedRequest, @Body() body: GrantSuperAdminDto) {
    const stepUp = await this.sessions.hasValidStepUp(request.adminAuth!.sessionId);
    if (!stepUp) {
      throw new ForbiddenException('Step-up authentication required');
    }
    const pending = await this.prisma.adminPrivilegedAction.create({
      data: {
        actionType: 'GRANT_SUPER_ADMIN',
        requestedByAdminId: request.adminAuth!.adminUserId,
        targetAdminId: body.targetAdminId,
        payload: { reason: body.reason },
      },
    });
    await this.audit.record({
      actorAdminId: request.adminAuth!.adminUserId,
      action: 'admin.super_admin.requested',
      targetType: 'admin_user',
      targetId: body.targetAdminId,
      reason: body.reason,
    });
    return pending;
  }

  @Post('privileged-actions/:id/approve')
  @RequireAdminPermissions(PERMISSIONS.ROLES_GRANT)
  @ApiOperation({ summary: 'Approve privileged action (different super_admin)' })
  async approve(@Req() request: AdminAuthenticatedRequest, @Param('id') id: string) {
    const approverId = request.adminAuth!.adminUserId;
    const isSuper = await this.rbac.hasRole(approverId, 'super_admin');
    if (!isSuper) {
      throw new ForbiddenException('Only super_admin can approve');
    }
    const stepUp = await this.sessions.hasValidStepUp(request.adminAuth!.sessionId);
    if (!stepUp) {
      throw new ForbiddenException('Step-up authentication required');
    }
    const action = await this.prisma.adminPrivilegedAction.findUnique({ where: { id } });
    if (!action || action.status !== 'PENDING') {
      throw new ForbiddenException('Action not pending');
    }
    if (action.requestedByAdminId === approverId) {
      throw new ForbiddenException('Dual approval requires a different admin');
    }
    if (action.actionType === 'GRANT_SUPER_ADMIN' && action.targetAdminId) {
      await this.prisma.adminRoleAssignment.upsert({
        where: {
          adminUserId_roleId: { adminUserId: action.targetAdminId, roleId: 'super_admin' },
        },
        create: {
          adminUserId: action.targetAdminId,
          roleId: 'super_admin',
          grantedByAdminId: approverId,
        },
        update: { grantedByAdminId: approverId },
      });
    }
    const resolved = await this.prisma.adminPrivilegedAction.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedByAdminId: approverId,
        resolvedAt: new Date(),
      },
    });
    await this.audit.record({
      actorAdminId: approverId,
      action: 'admin.privileged_action.approved',
      targetType: 'privileged_action',
      targetId: id,
    });
    return resolved;
  }

  @Get('privileged-actions/pending')
  @RequireAdminPermissions(PERMISSIONS.ROLES_GRANT)
  listPending() {
    return this.prisma.adminPrivilegedAction.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}