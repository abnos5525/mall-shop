import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import type { WebAuthnCredential } from '@mall-shop/database/identity';
import type { AppConfig } from '../../config/app.config';
import type { PrismaIdentityService } from '../../prisma/prisma-identity.service';

@Injectable()
export class AdminWebauthnService {
  constructor(
    private readonly prisma: PrismaIdentityService,
    private readonly configService: ConfigService,
  ) {}

  async registrationOptions(adminUserId: string, email: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const existing = await this.prisma.webAuthnCredential.findMany({ where: { adminUserId } });
    const { webauthnRpId } = this.rp();
    return generateRegistrationOptions({
      rpName: 'DropClub Admin',
      rpID: webauthnRpId,
      userName: email,
      userID: new TextEncoder().encode(adminUserId),
      attestationType: 'none',
      excludeCredentials: existing.map((cred: WebAuthnCredential) => ({
        id: cred.credentialId,
        transports: cred.transports?.split(',') as ('usb' | 'nfc' | 'ble' | 'internal' | 'hybrid')[] | undefined,
      })),
    });
  }

  async verifyRegistration(adminUserId: string, response: RegistrationResponseJSON, challenge: string) {
    const { webauthnRpId, webauthnOrigin } = this.rp();
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: webauthnOrigin,
      expectedRPID: webauthnRpId,
    });
    if (!verification.registrationInfo) {
      throw new Error('registration failed');
    }
    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    await this.prisma.webAuthnCredential.create({
      data: {
        adminUserId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        transports: credentialDeviceType && credentialBackedUp ? 'hybrid' : undefined,
      },
    });
    return { verified: true };
  }

  async authenticationOptions(adminUserId: string) {
    const creds = await this.prisma.webAuthnCredential.findMany({ where: { adminUserId } });
    const { webauthnRpId } = this.rp();
    return generateAuthenticationOptions({
      rpID: webauthnRpId,
      allowCredentials: creds.map((cred: WebAuthnCredential) => ({ id: cred.credentialId })),
    });
  }

  async verifyAuthentication(adminUserId: string, response: AuthenticationResponseJSON, challenge: string) {
    const cred = await this.prisma.webAuthnCredential.findUnique({
      where: { credentialId: response.id },
    });
    if (!cred || cred.adminUserId !== adminUserId) {
      throw new Error('credential not found');
    }
    const { webauthnRpId, webauthnOrigin } = this.rp();
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: webauthnOrigin,
      expectedRPID: webauthnRpId,
      credential: {
        id: cred.credentialId,
        publicKey: new Uint8Array(cred.publicKey),
        counter: Number(cred.counter),
      },
    });
    if (verification.verified) {
      await this.prisma.webAuthnCredential.update({
        where: { id: cred.id },
        data: { counter: verification.authenticationInfo.newCounter },
      });
    }
    return { verified: verification.verified };
  }

  private rp(): { webauthnRpId: string; webauthnOrigin: string } {
    const app = this.configService.get<AppConfig>('app');
    return {
      webauthnRpId: app?.webauthnRpId ?? 'localhost',
      webauthnOrigin: app?.webauthnOrigin ?? 'http://localhost:3001',
    };
  }
}