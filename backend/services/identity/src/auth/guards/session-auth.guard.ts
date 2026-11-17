import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthService } from '../auth.service';
import { ACCESS_COOKIE } from '../constants';

export type AuthenticatedRequest = FastifyRequest & {
  authUser?: Awaited<ReturnType<AuthService['verifyBearerAccessToken']>>;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const cookieToken =
      typeof request.cookies?.[ACCESS_COOKIE] === 'string'
        ? request.cookies[ACCESS_COOKIE]
        : undefined;
    const token = bearer ?? cookieToken;
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    request.authUser = await this.authService.verifyBearerAccessToken(token);
    return true;
  }
}