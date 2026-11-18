import { Module } from '@nestjs/common';
import { IdentityClientService } from './identity-client.service';
import { BearerSessionGuard } from './guards/bearer-session.guard';
import { IdentityMeController } from './identity-me.controller';
import { AdminBearerGuard } from './guards/admin-bearer.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';

@Module({
  controllers: [IdentityMeController],
  providers: [IdentityClientService, BearerSessionGuard, AdminBearerGuard, AdminPermissionGuard],
  exports: [IdentityClientService, BearerSessionGuard, AdminBearerGuard, AdminPermissionGuard],
})
export class IdentityModule {}