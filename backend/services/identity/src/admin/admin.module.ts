import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminSessionService } from './session/admin-session.service';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { PasswordService } from './crypto/password.service';
import { TotpService } from './crypto/totp.service';
import { AdminAuditService } from './audit/audit.service';
import { RbacService } from './rbac/rbac.service';
import { AdminPermissionGuard } from './rbac/admin-permission.guard';
import { AdminAccessController } from './admin-access.controller';
import { AdminAuditController } from './admin-audit.controller';
import { AdminWebauthnController } from './webauthn/admin-webauthn.controller';
import { AdminWebauthnService } from './webauthn/admin-webauthn.service';
import { MfaChallengeStore } from './mfa-challenge.store';

@Module({
  controllers: [
    AdminAuthController,
    AdminAccessController,
    AdminAuditController,
    AdminWebauthnController,
  ],
  providers: [
    AdminAuthService,
    AdminSessionService,
    AdminSessionGuard,
    PasswordService,
    TotpService,
    AdminAuditService,
    RbacService,
    AdminPermissionGuard,
    AdminWebauthnService,
    MfaChallengeStore,
  ],
  exports: [RbacService, AdminAuditService, AdminSessionService],
})
export class AdminModule {}