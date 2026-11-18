import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/app.config';
import type { AdminAuthService } from './admin-auth.service';
import type { AdminLoginDto } from './dto/admin-login.dto';
import type { AdminStepUpDto } from './dto/admin-step-up.dto';
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from './constants';
import { AdminSessionGuard, type AdminAuthenticatedRequest } from './guards/admin-session.guard';
import type { AdminSessionService } from './session/admin-session.service';
import type { RbacService } from './rbac/rbac.service';
import { createHash } from 'node:crypto';

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly auth: AdminAuthService,
    private readonly sessions: AdminSessionService,
    private readonly rbac: RbacService,
    private readonly configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Admin email/password login with TOTP or recovery code' })
  async login(
    @Body() body: AdminLoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.login({
      ...body,
      userAgent: request.headers['user-agent'],
      ipHash: request.ip ? createHash('sha256').update(request.ip).digest('hex') : undefined,
    });
    this.setCookies(reply, result.accessToken, result.refreshToken);
    return {
      email: result.email,
      displayName: result.displayName,
      permissions: result.permissions,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      sessionId: result.sessionId,
    };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AdminSessionGuard)
  @ApiBearerAuth()
  async logout(@Req() request: AdminAuthenticatedRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    if (request.adminAuth) {
      await this.sessions.revokeSessionById(request.adminAuth.adminUserId, request.adminAuth.sessionId);
    }
    this.clearCookies(reply);
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  @ApiBearerAuth()
  async me(@Req() request: AdminAuthenticatedRequest) {
    const permissions = await this.rbac.getPermissions(request.adminAuth!.adminUserId);
    return { email: request.adminAuth!.email, permissions };
  }

  @Get('sessions')
  @UseGuards(AdminSessionGuard)
  @ApiBearerAuth()
  listSessions(@Req() request: AdminAuthenticatedRequest) {
    return this.sessions.listSessions(request.adminAuth!.adminUserId);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(204)
  @UseGuards(AdminSessionGuard)
  @ApiBearerAuth()
  async revokeSession(
    @Req() request: AdminAuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.sessions.revokeSessionById(request.adminAuth!.adminUserId, sessionId);
  }

  @Post('step-up')
  @UseGuards(AdminSessionGuard)
  @ApiBearerAuth()
  stepUp(@Req() request: AdminAuthenticatedRequest, @Body() body: AdminStepUpDto) {
    return this.auth.stepUp(
      request.adminAuth!.adminUserId,
      request.adminAuth!.sessionId,
      body.password,
      body.totpCode,
    );
  }

  private setCookies(reply: FastifyReply, access: string, refresh: string): void {
    const app = this.configService.get<AppConfig>('app');
    const secure = app?.cookieSecure ?? false;
    const accessTtl = app?.adminSessionAccessTtlSeconds ?? 900;
    const refreshTtl = app?.adminSessionRefreshTtlSeconds ?? 86_400;
    const base = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
    void reply.setCookie(ADMIN_ACCESS_COOKIE, access, { ...base, maxAge: accessTtl });
    void reply.setCookie(ADMIN_REFRESH_COOKIE, refresh, { ...base, maxAge: refreshTtl });
  }

  private clearCookies(reply: FastifyReply): void {
    void reply.clearCookie(ADMIN_ACCESS_COOKIE, { path: '/' });
    void reply.clearCookie(ADMIN_REFRESH_COOKIE, { path: '/' });
  }
}