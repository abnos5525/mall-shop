import { Global, Module } from '@nestjs/common';
import { PrismaIdentityService } from './prisma-identity.service';

@Global()
@Module({
  providers: [PrismaIdentityService],
  exports: [PrismaIdentityService],
})
export class PrismaModule {}