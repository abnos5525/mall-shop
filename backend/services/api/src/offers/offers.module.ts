import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PublicReadCacheService } from '../common/cache/public-read-cache.service';
import { OffersService } from './offers.service';
import { PublicOffersController } from './public-offers.controller';
import { PublicCategoriesController } from './public-categories.controller';
import { AdminOffersController } from './admin-offers.controller';
import { AdminCategoriesController } from './admin-categories.controller';

@Module({
  imports: [IdentityModule],
  controllers: [
    PublicOffersController,
    PublicCategoriesController,
    AdminOffersController,
    AdminCategoriesController,
  ],
  providers: [OffersService, PublicReadCacheService],
})
export class OffersModule {}