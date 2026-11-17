import { Global, Module } from '@nestjs/common';
import { PrismaBusinessService } from './prisma-business.service';

@Global()
@Module({
  providers: [PrismaBusinessService],
  exports: [PrismaBusinessService],
})
export class PrismaModule {}