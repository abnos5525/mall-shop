import { Injectable } from '@nestjs/common';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';

@Injectable()
export class ConsentService {
  constructor(private readonly prisma: PrismaIdentityService) {}

  async setTelegramNotifications(userId: string, granted: boolean) {
    if (granted) {
      return this.prisma.userConsent.upsert({
        where: { userId_kind: { userId, kind: 'TELEGRAM_NOTIFICATIONS' } },
        create: { userId, kind: 'TELEGRAM_NOTIFICATIONS' },
        update: { revokedAt: null, grantedAt: new Date() },
      });
    }

    return this.prisma.userConsent.upsert({
      where: { userId_kind: { userId, kind: 'TELEGRAM_NOTIFICATIONS' } },
      create: { userId, kind: 'TELEGRAM_NOTIFICATIONS', revokedAt: new Date() },
      update: { revokedAt: new Date() },
    });
  }
}