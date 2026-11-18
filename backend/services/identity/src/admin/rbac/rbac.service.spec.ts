import { RbacService } from './rbac.service';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';

describe('RbacService', () => {
  it('denies unknown permissions by default', async () => {
    const prisma = {
      adminRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaIdentityService;
    const service = new RbacService(prisma);
    await expect(service.hasPermission('admin-id', 'users.read')).resolves.toBe(false);
  });
});