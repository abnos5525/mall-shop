import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AdminSessionService } from '../session/admin-session.service';
import { ADMIN_ACCESS_COOKIE } from '../constants';

export type AdminAuthenticatedRequest = FastifyRequest & {
  adminAuth?: {
    adminUserId: string;
    sessionId: string;
    email: string;
  };
};

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly sessions: AdminSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    const header = request.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const cookieToken =
      typeof request.cookies?.[ADMIN_ACCESS_COOKIE] === 'string'
        ? request.cookies[ADMIN_ACCESS_COOKIE]
        : undefined;
    const token = bearer ?? cookieToken;
    if (!token) {
      throw new UnauthorizedException('Admin authentication required');
    }
    const record = await this.sessions.verifyAccessToken(token);
    request.adminAuth = {
      adminUserId: record.adminUserId,
      sessionId: record.id,
      email: record.adminUser.email,
    };
    return true;
  }
}