import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { PublicUserProfile, UserStatus } from '@mall-shop/contracts';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';
import { generateOpaqueToken, hashToken } from '../crypto/token.util';
import type { AppConfig } from '../../config/app.config';
import type { ConfigService } from '@nestjs/config';

type CreateSessionInput = {
  userId: string;
  userAgent?: string;
  ipHash?: string;
};

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(input: CreateSessionInput) {
    const app = this.configService.get<AppConfig>('app');
    const accessTtl = app?.sessionAccessTtlSeconds ?? 900;
    const refreshTtl = app?.sessionRefreshTtlSeconds ?? 2_592_000;
    const now = new Date();

    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();
    const familyId = generateOpaqueToken(16);

    const session = await this.prisma.userSession.create({
      data: {
        userId: input.userId,
        sessionTokenHash: hashToken(accessToken),
        refreshTokenHash: hashToken(refreshToken),
        familyId,
        expiresAt: new Date(now.getTime() + accessTtl * 1000),
        refreshExpiresAt: new Date(now.getTime() + refreshTtl * 1000),
        userAgent: input.userAgent,
        ipHash: input.ipHash,
      },
      include: { user: { include: { telegram: true } } },
    });

    return {
      accessToken,
      refreshToken,
      session,
    };
  }

  async verifyAccessToken(token: string) {
    const record = await this.prisma.userSession.findFirst({
      where: {
        sessionTokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { telegram: true } } },
    });
    if (!record || record.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired session');
    }
    await this.prisma.userSession.update({
      where: { id: record.id },
      data: { lastSeenAt: new Date() },
    });
    return record;
  }

  async refreshSession(refreshToken: string) {
    const hash = hashToken(refreshToken);
    const existing = await this.prisma.userSession.findFirst({
      where: { refreshTokenHash: hash },
      include: { user: { include: { telegram: true } } },
    });
    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt || existing.refreshExpiresAt <= new Date()) {
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    await this.prisma.userSession.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return this.createSession({ userId: existing.userId, userAgent: existing.userAgent ?? undefined });
  }

  async revokeSessionById(userId: string, sessionId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeOtherSessions(userId: string, keepSessionId: string): Promise<number> {
    const result = await this.prisma.userSession.updateMany({
      where: { userId, id: { not: keepSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  async listSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, revokedAt: null, refreshExpiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
        userAgent: true,
      },
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static toPublicProfile(user: {
    id: string;
    status: UserStatus;
    telegram: {
      telegramUserId: bigint;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      languageCode: string | null;
    } | null;
  }): PublicUserProfile {
    if (!user.telegram) {
      throw new UnauthorizedException('User has no telegram profile');
    }
    return {
      subjectId: user.id,
      status: user.status,
      telegramUserId: user.telegram.telegramUserId.toString(),
      username: user.telegram.username,
      firstName: user.telegram.firstName,
      lastName: user.telegram.lastName,
      languageCode: user.telegram.languageCode,
    };
  }
}