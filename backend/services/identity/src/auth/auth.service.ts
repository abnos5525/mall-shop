import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { AuthSessionResponse } from '@mall-shop/contracts';

export type LoginWithTelegramResult = AuthSessionResponse & { refreshToken: string };
import type { AppConfig } from '../config/app.config';
import type { InitDataReplayService } from './replay/init-data-replay.service';
import { SessionService } from './session/session.service';
import { parseInitData } from './telegram/telegram-init-data';
import type { PrismaIdentityService } from '../prisma/prisma-identity.service';
import { createHash } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly configService: ConfigService,
    private readonly sessions: SessionService,
    private readonly replay: InitDataReplayService,
  ) {}

  async loginWithTelegramInitData(
    rawInitData: string,
    userAgent?: string,
    ipHash?: string,
  ): Promise<LoginWithTelegramResult> {
    const app = this.configService.get<AppConfig>('app');
    const botToken = app?.telegramBotToken;
    if (!botToken) {
      throw new ServiceUnavailableException('Telegram authentication is not configured');
    }

    const verified = parseInitData(rawInitData, botToken, app?.telegramInitDataMaxAgeSeconds ?? 300);
    if (!verified.ok) {
      throw new UnauthorizedException(`Telegram authentication failed: ${verified.error}`);
    }

    const replayAllowed = await this.replay.assertFirstUse(
      rawInitData,
      (app?.telegramInitDataMaxAgeSeconds ?? 300) + 60,
    );
    if (!replayAllowed) {
      throw new UnauthorizedException('Telegram initData replay detected');
    }

    const tgUser = verified.data.user;
    const telegramUserId = BigInt(tgUser.id);

    const user = await this.prisma.$transaction(async (tx) => {
      const account = await tx.telegramAccount.findUnique({
        where: { telegramUserId },
        include: { user: true },
      });
      if (account) {
        await tx.telegramAccount.update({
          where: { id: account.id },
          data: {
            username: tgUser.username ?? null,
            firstName: tgUser.first_name ?? null,
            lastName: tgUser.last_name ?? null,
            languageCode: tgUser.language_code ?? null,
            photoUrl: tgUser.photo_url ?? null,
          },
        });
        return tx.user.findUniqueOrThrow({
          where: { id: account.userId },
          include: { telegram: true },
        });
      }

      return tx.user.create({
        data: {
          telegram: {
            create: {
              telegramUserId,
              username: tgUser.username ?? null,
              firstName: tgUser.first_name ?? null,
              lastName: tgUser.last_name ?? null,
              languageCode: tgUser.language_code ?? null,
              photoUrl: tgUser.photo_url ?? null,
            },
          },
        },
        include: { telegram: true },
      });
    });

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const session = await this.sessions.createSession({
      userId: user.id,
      userAgent,
      ipHash,
    });

    return {
      user: SessionService.toPublicProfile(user),
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.session.expiresAt.toISOString(),
      sessionId: session.session.id,
    };
  }

  async verifyBearerAccessToken(token: string) {
    const record = await this.sessions.verifyAccessToken(token);
    return {
      subjectId: record.user.id,
      status: record.user.status,
      sessionId: record.id,
      user: SessionService.toPublicProfile(record.user),
    };
  }

  refreshFromToken(refreshToken: string) {
    if (!refreshToken.trim()) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.sessions.refreshSession(refreshToken);
  }

  hashIp(ip: string | undefined): string | undefined {
    if (!ip) {
      return undefined;
    }
    return createHash('sha256').update(ip).digest('hex');
  }
}