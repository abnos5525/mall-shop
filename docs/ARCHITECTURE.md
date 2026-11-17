# Architecture

## Deployable applications
- `frontend/`: Next.js Telegram Mini App and public web fallback.
- `frontend-admin/`: separate Next.js admin app on a separate origin.
- `backend/services/identity/`: NestJS identity service; owns Identity PostgreSQL database.
- `backend/services/api/`: NestJS Business API; owns Business PostgreSQL database.
- `backend/services/worker/`: NestJS BullMQ worker for background jobs.
- `backend/packages/contracts/`: minimal shared service contracts only.

## Database boundaries
- Identity DB and Business DB are separate PostgreSQL databases with separate credentials, migration roles, backups and network permissions.
- Identity DB owns user identity, Telegram mapping, sessions, roles, permissions, MFA metadata, consents and identity security events.
- Business DB owns offers, categories, favorites, demand requests, merchants, affiliate destinations, clicks and campaign data.
- Use UUID user subject IDs in Business DB. No cross-database foreign keys or shared Prisma model ownership.
- Business API obtains identity/permission assertions from the Identity service through authenticated internal calls or short-lived signed service assertions. Never accept client-provided role claims.
- Separate Prisma schema/client and migration lifecycle per database.

## Service boundaries
- Identity service: auth, sessions, users, RBAC, admin identity and identity audit.
- Business API: offers, categories, favorites, demand requests, affiliate, admin business operations, analytics.
- Worker: async jobs, notifications and expiry processing.
- Keep services coarse-grained. Do not split each feature into a microservice without evidence.

## Authentication
- Telegram raw initData is validated server-side according to official Telegram docs; auth_date freshness enforced.
- Never trust initDataUnsafe.
- Public user sessions use secure HttpOnly cookies or a carefully designed opaque session strategy; rotate/revoke sessions.
- Admin uses separate origin/session and MFA/passkeys; Telegram login alone is insufficient for admin privileges.
- Authorization is deny-by-default and checked on every request and object.

## API conventions
- Prefix `/api/v1`.
- Mandatory Swagger/OpenAPI at `/api/docs` and `/api/docs-json` in development; off by default in production.
- Document every route, DTO, parameter, response, error and actual authentication mechanism.
- Strict DTO validation, safe serialization, bounded pagination and rate limits.
- Do not expose Prisma records directly.

## Scalability
- Stateless API/identity replicas behind a trusted load balancer.
- Redis/BullMQ for background work, with idempotent jobs and bounded concurrency.
- Connection pooling and explicit DB connection budgets per service.
- Index measured query paths; cursor pagination for event tables; avoid N+1.
- Cache public offer reads only; never shared-cache private/admin data.
- Load test with realistic traffic before setting capacity promises.

## Security and operations
- Follow `docs/SECURITY-ARCHITECTURE.md`, `docs/THREAT-MODEL.md`, and `docs/SECURITY-CHECKLIST.md`.
- Private databases/Redis, separate least-privilege credentials, secrets manager, encrypted backups.
- WAF/DDoS edge controls, TLS, security headers, CSRF/CORS protections, request limits and distributed throttling.
- Structured logs, metrics, traces, alerting, backup restore drills and incident runbooks.
