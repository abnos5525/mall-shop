import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';
import { generateOpaqueToken, hashToken } from '../../auth/crypto/token.util';
import type { AppConfig } from '../../config/app.config';

@Injectable()
export class AdminSessionService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(adminUserId: string, userAgent?: string, ipHash?: string) {
    const app = this.configService.get<AppConfig>('app');
    const accessTtl = app?.adminSessionAccessTtlSeconds ?? 900;
    const refreshTtl = app?.adminSessionRefreshTtlSeconds ?? 86_400;
    const now = new Date();
    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();
    const familyId = generateOpaqueToken(16);
    const session = await this.prisma.adminSession.create({
      data: {
        adminUserId,
        sessionTokenHash: hashToken(accessToken),
        refreshTokenHash: hashToken(refreshToken),
        familyId,
        expiresAt: new Date(now.getTime() + accessTtl * 1000),
        refreshExpiresAt: new Date(now.getTime() + refreshTtl * 1000),
        userAgent,
        ipHash,
      },
    });
    return { accessToken, refreshToken, session };
  }

  async verifyAccessToken(token: string) {
    const record = await this.prisma.adminSession.findFirst({
      where: {
        sessionTokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { adminUser: true },
    });
    if (!record || record.adminUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid admin session');
    }
    await this.prisma.adminSession.update({
      where: { id: record.id },
      data: { lastSeenAt: new Date() },
    });
    return record;
  }

  async markStepUp(sessionId: string, ttlSeconds = 300): Promise<void> {
    await this.prisma.adminSession.update({
      where: { id: sessionId },
      data: { stepUpValidUntil: new Date(Date.now() + ttlSeconds * 1000) },
    });
  }

  async hasValidStepUp(sessionId: string): Promise<boolean> {
    const session = await this.prisma.adminSession.findUnique({ where: { id: sessionId } });
    if (!session?.stepUpValidUntil) {
      return false;
    }
    return session.stepUpValidUntil > new Date();
  }

  async revokeSessionById(adminUserId: string, sessionId: string): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: { id: sessionId, adminUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async listSessions(adminUserId: string) {
    return this.prisma.adminSession.findMany({
      where: { adminUserId, revokedAt: null, refreshExpiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
        userAgent: true,
        stepUpValidUntil: true,
      },
    });
  }
}