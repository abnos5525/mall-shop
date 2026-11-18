import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { InternalAdminVerification } from '@mall-shop/contracts';
import type { IdentityClientService } from '../identity-client.service';

export type AdminVerifiedRequest = FastifyRequest & {
  adminAuth?: InternalAdminVerification;
};

@Injectable()
export class AdminBearerGuard implements CanActivate {
  constructor(private readonly identityClient: IdentityClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminVerifiedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin bearer token required');
    }
    const token = header.slice(7);
    request.adminAuth = await this.identityClient.verifyAdminAccessToken(token);
    return true;
  }
}

export function assertAdminPermission(request: AdminVerifiedRequest, permission: string): void {
  if (!request.adminAuth?.permissions.includes(permission)) {
    throw new ForbiddenException('Insufficient admin permissions');
  }
}