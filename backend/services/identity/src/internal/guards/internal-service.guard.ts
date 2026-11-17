import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import type { AppConfig } from '../../config/app.config';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const provided = request.headers['x-internal-service-key'];
    const app = this.configService.get<AppConfig>('app');
    const expected = app?.internalServiceSecret;
    if (!expected || typeof provided !== 'string') {
      throw new UnauthorizedException('Internal authentication failed');
    }
    const left = Buffer.from(provided);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new UnauthorizedException('Internal authentication failed');
    }
    return true;
  }
}