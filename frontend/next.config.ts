import type { NextConfig } from 'next';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const apiOrigin = new URL(apiBase).origin;

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `connect-src 'self' ${apiOrigin} https://telegram.org https://*.telegram.org`,
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://telegram.org",
      "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;