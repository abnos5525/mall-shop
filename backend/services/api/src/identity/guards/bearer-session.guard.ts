import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { InternalSessionVerification } from '@mall-shop/contracts';
import type { IdentityClientService } from '../identity-client.service';

export type VerifiedRequest = FastifyRequest & {
  identity?: InternalSessionVerification;
};

@Injectable()
export class BearerSessionGuard implements CanActivate {
  constructor(private readonly identityClient: IdentityClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<VerifiedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token required');
    }
    const token = header.slice(7);
    request.identity = await this.identityClient.verifyAccessToken(token);
    if (request.identity.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }
    return true;
  }
}