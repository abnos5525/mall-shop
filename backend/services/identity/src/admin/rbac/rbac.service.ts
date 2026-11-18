import { Injectable } from '@nestjs/common';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaIdentityService) {}

  async getPermissions(adminUserId: string): Promise<string[]> {
    const assignments = await this.prisma.adminRoleAssignment.findMany({
      where: { adminUserId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    const set = new Set<string>();
    for (const assignment of assignments) {
      for (const rp of assignment.role.permissions) {
        set.add(rp.permission.id);
      }
    }
    return [...set];
  }

  async hasPermission(adminUserId: string, permissionId: string): Promise<boolean> {
    const permissions = await this.getPermissions(adminUserId);
    return permissions.includes(permissionId);
  }

  async hasRole(adminUserId: string, roleId: string): Promise<boolean> {
    const row = await this.prisma.adminRoleAssignment.findUnique({
      where: { adminUserId_roleId: { adminUserId, roleId } },
    });
    return Boolean(row);
  }
}