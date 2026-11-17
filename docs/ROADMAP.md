# Gated roadmap — DropClub

Only one phase may be implemented per authorization. The exact phrase `برو بعدی` authorizes the next phase only.

## Phase 1 — Secure foundation + visible slice (initially authorized)
Backend first:
- pnpm workspace and strict TypeScript tooling.
- NestJS API foundation, config validation, structured logging, request IDs.
- Security baseline: headers, CORS allowlist, request size limits, global DTO validation, safe errors, rate-limit foundation, no secret logging.
- Swagger/OpenAPI at `/api/docs` and `/api/docs-json` in development; disabled by default in production.
- Separate PostgreSQL databases and credentials: Identity DB and Business DB; separate Prisma schemas/clients/migrations and migration roles.
- Redis private local infrastructure; worker skeleton with BullMQ and graceful shutdown.
- Docker Compose for local development only; production network/secret hardening documented.
Then frontend:
- Next.js Mini App shell, Persian RTL, mobile-first.
- Separate `frontend-admin/` app shell with no real admin access until auth phase.
- Public app displays API health; admin shell displays protected placeholder, not an insecure fake login.
- Security headers/CSP plan and env examples.
Exit: both DBs connect independently; API/worker run; Swagger works; health UI works; admin app shell builds; checks pass; docs/progress updated.

## Phase 2 — Identity service and Telegram authentication
- Independently deployable NestJS identity service owning Identity DB.
- Telegram initData HMAC verification, auth_date freshness and replay controls.
- Public user session lifecycle, secure cookie/session strategy, rotation and revocation.
- User profile/status, consent and device/session management.
- Internal service authentication between Business API and Identity service.
- No trust in initDataUnsafe or client roles.
- Tests for invalid/tampered/stale/replayed payloads and session revocation.

## Phase 3 — Admin authentication and access control
- Separate admin origin/app and separate admin session.
- Passkey/WebAuthn MFA; TOTP fallback and hashed one-time recovery codes.
- RBAC granular permissions, deny-by-default guards and policy tests.
- Step-up auth and dual approval for critical role/security actions.
- Admin login, session/device list, revoke sessions and immutable audit events.
- First admin user provisioned securely through one-time CLI/bootstrap process; no default credentials.

## Phase 4 — Offers and categories
- Business DB models/migrations, public listing/detail endpoints.
- Admin-protected create/update/publish/archive endpoints.
- Swagger DTO/schema/response documentation for every route.
- Frontend home, categories, listing, detail and admin offer management.
- Pagination, caching and query indexes.

## Phase 5 — Affiliate tracking
- Safe `/go/:slug` redirect resolved server-side.
- Click event tracking, partner config and basic analytics.
- Affiliate disclosure; no arbitrary redirects or false sales attribution.
- Rate limits, idempotency and abuse monitoring.

## Phase 6 — Favorites and demand requests
- Favorite/unfavorite, favorites page.
- "I want this" form with minimal data and explicit consent.
- Rate limiting, spam prevention, admin moderation and privacy workflow.

## Phase 7 — Notifications and worker jobs
- Opt-in/out preferences.
- Telegram notifications and offer expiry jobs.
- Idempotency, retry/backoff, dead-letter handling and queue monitoring.

## Phase 8 — Full admin operations
- User management, roles, offer moderation, affiliate configuration, demand requests, analytics, audit/security explorer, feature flags and system status.
- Sensitive exports, deletion and bulk operations require step-up and audit.

## Phase 9 — Production hardening and scale
- OWASP ASVS 5.0 Level 2 verification evidence.
- OWASP API Top 10 test suite.
- SAST, dependency/secret/container scanning and SBOM in CI.
- E2E, DAST and independent penetration test.
- k6 load/soak/burst tests and DB query/index review.
- WAF/DDoS, TLS, private networking, secrets manager, backup/PITR, restore drills, monitoring, alerts, SLO/RPO/RTO and incident runbooks.
- Production deployment, rollback and disaster recovery rehearsal.

## Phase discipline
After each phase: run checks, update `docs/PROGRESS.md`, report exact commands/results and stop. Never begin the next phase without the exact authorization phrase.
