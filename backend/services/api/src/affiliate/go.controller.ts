import { Controller, Get, Headers, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IdentityClientService } from '../identity/identity-client.service';
import type { GoService } from './go.service';

@ApiTags('affiliate')
@Controller('go')
export class GoController {
  constructor(
    private readonly go: GoService,
    private readonly identityClient: IdentityClientService,
  ) {}

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get(':slug')
  @ApiOperation({
    summary: 'Tracked outbound redirect for a published offer slug (http/https only)',
  })
  async redirect(
    @Param('slug') slug: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('authorization') authorization?: string,
  ) {
    const subjectId = await this.optionalSubjectId(authorization);
    const pepper = process.env.SESSION_SECRET ?? 'dev-only-change-me-32-characters-min';
    const result = await this.go.resolveRedirect(slug, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      subjectId,
      idempotencyKey: idempotencyKey?.trim() || undefined,
      hashPepper: pepper,
    });
    void result.recorded;
    return reply.redirect(result.redirectUrl, 302);
  }

  private async optionalSubjectId(authorization?: string): Promise<string | undefined> {
    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }
    try {
      const verified = await this.identityClient.verifyAccessToken(authorization.slice(7));
      return verified.subjectId;
    } catch {
      return undefined;
    }
  }
}