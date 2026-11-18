import { Injectable } from '@nestjs/common';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';

type AuditInput = {
  actorAdminId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
};

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaIdentityService) {}

  async record(input: AuditInput) {
    return this.prisma.adminAuditEvent.create({
      data: {
        actorAdminId: input.actorAdminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        metadata: input.metadata as object | undefined,
        requestId: input.requestId,
      },
    });
  }
}