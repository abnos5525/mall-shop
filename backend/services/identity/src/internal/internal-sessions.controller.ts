import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InternalSessionVerification } from '@mall-shop/contracts';
import type { AuthService } from '../auth/auth.service';
import type { VerifySessionDto } from './dto/verify-session.dto';
import { InternalServiceGuard } from './guards/internal-service.guard';

@ApiTags('internal')
@Controller('internal/sessions')
@UseGuards(InternalServiceGuard)
export class InternalSessionsController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify user access token for internal services' })
  async verify(@Body() body: VerifySessionDto): Promise<InternalSessionVerification> {
    const verified = await this.authService.verifyBearerAccessToken(body.token);
    return {
      subjectId: verified.subjectId,
      status: verified.status,
      sessionId: verified.sessionId,
    };
  }
}