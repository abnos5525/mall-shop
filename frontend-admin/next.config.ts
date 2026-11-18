import path from 'node:path';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

const repoRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local') });

const identityBase =
  process.env.NEXT_PUBLIC_IDENTITY_BASE_URL ?? 'http://localhost:4100/api/v1';
const identityOrigin = new URL(identityBase).origin;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const apiOrigin = new URL(apiBase).origin;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `connect-src 'self' ${identityOrigin} ${apiOrigin}`,
              "script-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;