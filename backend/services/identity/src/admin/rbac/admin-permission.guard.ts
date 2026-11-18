import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSIONS_KEY } from './require-permissions.decorator';
import type { RbacService } from './rbac.service';
import type { AdminAuthenticatedRequest } from '../guards/admin-session.guard';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (required.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    const adminId = request.adminAuth?.adminUserId;
    if (!adminId) {
      throw new ForbiddenException('Admin authentication required');
    }
    for (const permission of required) {
      const allowed = await this.rbac.hasPermission(adminId, permission);
      if (!allowed) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
    }
    return true;
  }
}