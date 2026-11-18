import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FavoritesService } from './favorites.service';
import { DemandService } from './demand.service';
import { FavoritesController } from './favorites.controller';
import { DemandController } from './demand.controller';
import { AdminDemandController } from './admin-demand.controller';

@Module({
  imports: [IdentityModule],
  controllers: [FavoritesController, DemandController, AdminDemandController],
  providers: [FavoritesService, DemandService],
})
export class EngagementModule {}