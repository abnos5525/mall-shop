import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { GoController } from './go.controller';
import { GoService } from './go.service';
import { AffiliateAnalyticsService } from './analytics.service';
import { AdminAffiliateController } from './admin-affiliate.controller';

@Module({
  imports: [IdentityModule],
  controllers: [GoController, AdminAffiliateController],
  providers: [GoService, AffiliateAnalyticsService],
})
export class AffiliateModule {}