import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { InternalAdminController } from './internal-admin.controller';
import { InternalServiceGuard } from './guards/internal-service.guard';

@Module({
  imports: [AdminModule],
  controllers: [InternalAdminController],
  providers: [InternalServiceGuard],
})
export class InternalAdminModule {}