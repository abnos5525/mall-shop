import { randomBytes } from 'node:crypto';
import { PrismaClient } from '../../../packages/database/generated/identity/index.js';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import { createCipheriv, createHash, randomBytes as rb } from 'node:crypto';

function encryptSecret(secret: string, sessionSecret: string): string {
  const key = createHash('sha256').update(sessionSecret).digest();
  const iv = rb(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: pnpm provision-admin -- <email> [password]');
    process.exit(1);
  }
  const password = process.argv[3] ?? randomBytes(18).toString('base64url');
  const sessionSecret = process.env.SESSION_SECRET ?? 'dev-only-change-me-32-characters-min';
  const prisma = new PrismaClient();
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error('Admin user already exists for this email.');
    process.exit(1);
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const totpSecret = authenticator.generateSecret();
  const enc = encryptSecret(totpSecret, sessionSecret);
  const recoveryCodes = Array.from({ length: 8 }, () => randomBytes(5).toString('hex'));
  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      displayName: 'Bootstrap Admin',
      totpEnabled: true,
      totpSecret: { create: { secretEnc: enc } },
      recoveryCodes: {
        create: recoveryCodes.map((code) => ({ codeHash: hashToken(code) })),
      },
      roleAssignments: {
        create: { roleId: 'super_admin' },
      },
    },
  });
  console.log('Admin provisioned successfully.');
  console.log(`id: ${admin.id}`);
  console.log(`email: ${email}`);
  console.log(`temporary_password: ${password}`);
  console.log(`totp_secret: ${totpSecret}`);
  console.log(`totp_auth_url: ${authenticator.keyuri(email, 'DropClub Admin', totpSecret)}`);
  console.log('recovery_codes (one-time, store securely):');
  for (const code of recoveryCodes) {
    console.log(`- ${code}`);
  }
  await prisma.$disconnect();
}

void main();