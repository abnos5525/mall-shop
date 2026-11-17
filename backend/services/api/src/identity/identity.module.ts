import { Module } from '@nestjs/common';
import { IdentityClientService } from './identity-client.service';
import { BearerSessionGuard } from './guards/bearer-session.guard';
import { IdentityMeController } from './identity-me.controller';

@Module({
  controllers: [IdentityMeController],
  providers: [IdentityClientService, BearerSessionGuard],
  exports: [IdentityClientService, BearerSessionGuard],
})
export class IdentityModule {}