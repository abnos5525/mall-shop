import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthSessionResponse, PublicUserProfile } from '@mall-shop/contracts';
import type { AuthService } from './auth.service';
import type { TelegramLoginDto } from './dto/telegram-login.dto';
import type { NotificationConsentDto } from './dto/notification-consent.dto';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './constants';
import { SessionAuthGuard, type AuthenticatedRequest } from './guards/session-auth.guard';
import { SessionService } from './session/session.service';
import type { ConsentService } from './consent/consent.service';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/app.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessions: SessionService,
    private readonly configService: ConfigService,
    private readonly consents: ConsentService,
  ) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('telegram')
  @ApiOperation({ summary: 'Authenticate using raw Telegram initData' })
  async loginWithTelegram(
    @Body() body: TelegramLoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionResponse> {
    const result = await this.authService.loginWithTelegramInitData(
      body.initData,
      request.headers['user-agent'],
      this.authService.hashIp(request.ip),
    );
    this.setSessionCookies(reply, result.accessToken, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      sessionId: result.sessionId,
    };
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate session using HttpOnly refresh cookie' })
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionResponse> {
    const refreshToken = request.cookies?.[REFRESH_COOKIE];
    if (typeof refreshToken !== 'string') {
      throw new BadRequestException('Refresh cookie is required');
    }
    const rotated = await this.sessions.refreshSession(refreshToken);
    this.setSessionCookies(reply, rotated.accessToken, rotated.refreshToken);
    const user = SessionService.toPublicProfile(rotated.session.user);
    return {
      user,
      accessToken: rotated.accessToken,
      accessTokenExpiresAt: rotated.session.expiresAt.toISOString(),
      sessionId: rotated.session.id,
    };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    if (request.authUser) {
      await this.sessions.revokeSessionById(request.authUser.subjectId, request.authUser.sessionId);
    }
    this.clearSessionCookies(reply);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user profile' })
  me(@Req() request: AuthenticatedRequest): PublicUserProfile {
    return request.authUser!.user;
  }

  @Get('sessions')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  listSessions(@Req() request: AuthenticatedRequest) {
    return this.sessions.listSessions(request.authUser!.subjectId);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(204)
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  async revokeSession(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.sessions.revokeSessionById(request.authUser!.subjectId, sessionId);
  }

  @Put('consents/notifications')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  setNotificationConsent(@Req() request: AuthenticatedRequest, @Body() body: NotificationConsentDto) {
    return this.consents.setTelegramNotifications(request.authUser!.subjectId, body.granted);
  }

  @Delete('sessions')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  async revokeOtherSessions(@Req() request: AuthenticatedRequest): Promise<{ revoked: number }> {
    const revoked = await this.sessions.revokeOtherSessions(
      request.authUser!.subjectId,
      request.authUser!.sessionId,
    );
    return { revoked };
  }

  private setSessionCookies(reply: FastifyReply, accessToken: string, refreshToken: string): void {
    const app = this.configService.get<AppConfig>('app');
    const secure = app?.cookieSecure ?? false;
    const accessTtl = app?.sessionAccessTtlSeconds ?? 900;
    const refreshTtl = app?.sessionRefreshTtlSeconds ?? 2_592_000;
    const cookieBase = {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
    };
    void reply.setCookie(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: accessTtl });
    void reply.setCookie(REFRESH_COOKIE, refreshToken, { ...cookieBase, maxAge: refreshTtl });
  }

  private clearSessionCookies(reply: FastifyReply): void {
    void reply.clearCookie(ACCESS_COOKIE, { path: '/' });
    void reply.clearCookie(REFRESH_COOKIE, { path: '/' });
  }
}