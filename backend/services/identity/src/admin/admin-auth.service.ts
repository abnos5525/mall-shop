import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { PrismaIdentityService } from '../prisma/prisma-identity.service';
import type { PasswordService } from './crypto/password.service';
import type { TotpService } from './crypto/totp.service';
import type { AdminSessionService } from './session/admin-session.service';
import type { AdminAuditService } from './audit/audit.service';
import type { RbacService } from './rbac/rbac.service';
import { hashToken } from '../auth/crypto/token.util';

type LoginInput = {
  email: string;
  password: string;
  totpCode?: string;
  recoveryCode?: string;
  userAgent?: string;
  ipHash?: string;
};

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly passwords: PasswordService,
    private readonly totp: TotpService,
    private readonly sessions: AdminSessionService,
    private readonly audit: AdminAuditService,
    private readonly rbac: RbacService,
  ) {}

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
      include: { totpSecret: true, recoveryCodes: { where: { usedAt: null } } },
    });
    if (!admin || admin.status !== 'ACTIVE') {
      await this.audit.record({ action: 'admin.login.failed', metadata: { email } });
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordOk = await this.passwords.verify(admin.passwordHash, input.password);
    if (!passwordOk) {
      await this.audit.record({
        actorAdminId: admin.id,
        action: 'admin.login.failed',
        metadata: { reason: 'bad_password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.totpEnabled) {
      if (input.recoveryCode) {
        await this.consumeRecoveryCode(admin.id, input.recoveryCode);
      } else if (input.totpCode && admin.totpSecret) {
        const secret = this.totp.decryptSecret(admin.totpSecret.secretEnc);
        if (!this.totp.verify(secret, input.totpCode)) {
          throw new UnauthorizedException('Invalid TOTP code');
        }
      } else {
        throw new UnauthorizedException('MFA required');
      }
    }

    const session = await this.sessions.createSession(admin.id, input.userAgent, input.ipHash);
    await this.audit.record({
      actorAdminId: admin.id,
      action: 'admin.login.success',
      targetType: 'admin_session',
      targetId: session.session.id,
    });
    const permissions = await this.rbac.getPermissions(admin.id);
    return {
      adminUserId: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      permissions,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.session.id,
      expiresAt: session.session.expiresAt.toISOString(),
    };
  }

  async stepUp(adminUserId: string, sessionId: string, password: string, totpCode: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { totpSecret: true },
    });
    if (!admin?.totpSecret) {
      throw new BadRequestException('TOTP is not configured');
    }
    if (!(await this.passwords.verify(admin.passwordHash, password))) {
      throw new UnauthorizedException('Invalid password');
    }
    const secret = this.totp.decryptSecret(admin.totpSecret.secretEnc);
    if (!this.totp.verify(secret, totpCode)) {
      throw new UnauthorizedException('Invalid TOTP code');
    }
    await this.sessions.markStepUp(sessionId);
    await this.audit.record({
      actorAdminId: adminUserId,
      action: 'admin.step_up.success',
      targetType: 'admin_session',
      targetId: sessionId,
    });
    return { ok: true, validForSeconds: 300 };
  }

  private async consumeRecoveryCode(adminUserId: string, plain: string): Promise<void> {
    const hash = hashToken(plain.trim());
    const row = await this.prisma.adminRecoveryCode.findFirst({
      where: { adminUserId, codeHash: hash, usedAt: null },
    });
    if (!row) {
      throw new UnauthorizedException('Invalid recovery code');
    }
    await this.prisma.adminRecoveryCode.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    await this.audit.record({
      actorAdminId: adminUserId,
      action: 'admin.mfa.recovery_code_used',
    });
  }
}