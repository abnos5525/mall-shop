import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import type { AdminWebauthnService } from './admin-webauthn.service';
import { AdminSessionGuard, type AdminAuthenticatedRequest } from '../guards/admin-session.guard';
import type { MfaChallengeStore } from '../mfa-challenge.store';

class WebauthnVerifyDto {
  response!: RegistrationResponseJSON | AuthenticationResponseJSON;
  challenge!: string;
}

@ApiTags('admin-webauthn')
@Controller('admin/auth/webauthn')
@UseGuards(AdminSessionGuard)
@ApiBearerAuth()
export class AdminWebauthnController {
  constructor(
    private readonly webauthn: AdminWebauthnService,
    private readonly challenges: MfaChallengeStore,
  ) {}

  @Get('register/options')
  @ApiOperation({ summary: 'Begin WebAuthn passkey registration' })
  async registerOptions(@Req() request: AdminAuthenticatedRequest) {
    const options = await this.webauthn.registrationOptions(
      request.adminAuth!.adminUserId,
      request.adminAuth!.email,
    );
    await this.challenges.save(
      `webauthn:register:${request.adminAuth!.adminUserId}`,
      options.challenge,
      300,
    );
    return options;
  }

  @Post('register/verify')
  async registerVerify(@Req() request: AdminAuthenticatedRequest, @Body() body: WebauthnVerifyDto) {
    await this.challenges.assert(
      `webauthn:register:${request.adminAuth!.adminUserId}`,
      body.challenge,
    );
    return this.webauthn.verifyRegistration(
      request.adminAuth!.adminUserId,
      body.response as RegistrationResponseJSON,
      body.challenge,
    );
  }
}