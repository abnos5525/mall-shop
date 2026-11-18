import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InternalAdminVerification } from '@mall-shop/contracts';
import { InternalServiceGuard } from './guards/internal-service.guard';
import type { AdminSessionService } from '../admin/session/admin-session.service';
import type { RbacService } from '../admin/rbac/rbac.service';
import type { AdminAuditService } from '../admin/audit/audit.service';
import type { VerifyAdminSessionDto } from './dto/verify-admin-session.dto';
import type { RecordAuditDto } from './dto/record-audit.dto';

@ApiTags('internal')
@Controller('internal/admin')
@UseGuards(InternalServiceGuard)
export class InternalAdminController {
  constructor(
    private readonly adminSessions: AdminSessionService,
    private readonly rbac: RbacService,
    private readonly audit: AdminAuditService,
  ) {}

  @Post('sessions/verify')
  @ApiOperation({ summary: 'Verify admin access token for internal services' })
  async verify(@Body() body: VerifyAdminSessionDto): Promise<InternalAdminVerification> {
    const session = await this.adminSessions.verifyAccessToken(body.token);
    const permissions = await this.rbac.getPermissions(session.adminUserId);
    return {
      adminUserId: session.adminUserId,
      email: session.adminUser.email,
      sessionId: session.id,
      permissions,
    };
  }

  @Post('audit/events')
  @ApiOperation({ summary: 'Record admin audit event from trusted internal caller' })
  async recordAudit(@Body() body: RecordAuditDto) {
    return this.audit.record(body);
  }
}