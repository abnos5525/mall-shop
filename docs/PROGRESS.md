# Progress

- Current authorized phase: **Phase 3** (completed — Phase 4 locked until user sends `برو بعدی`)
- Status: Phase 3 completed
- Last completed phase: Phase 3 — Admin authentication and access control
- Next phase: Phase 4 — Offers and categories

## Phase 1 checklist
- [x] Workspace and strict TypeScript tooling
- [x] Identity service skeleton and separate Identity DB
- [x] Business API skeleton and separate Business DB
- [x] Separate DB credentials and migration roles (local Docker init)
- [x] Worker + Redis/BullMQ skeleton
- [x] Security baseline (headers, CORS, validation, request limits, safe logs)
- [x] Swagger UI `/api/docs` and OpenAPI JSON `/api/docs-json`
- [x] Frontend Mini App shell and health indicator
- [x] Separate admin app shell
- [x] Environment examples and local infrastructure docs
- [x] Format/lint/typecheck/tests/build verified

## Phase 2 checklist
- [x] Identity DB models (User, TelegramAccount, Session, Consent)
- [x] Telegram initData HMAC + auth_date validation
- [x] initData replay protection (Redis NX)
- [x] Session lifecycle (create, refresh rotation, revoke, list)
- [x] HttpOnly cookies + Bearer access token for Business API
- [x] Internal session verify (`X-Internal-Service-Key`)
- [x] Business API `GET /api/v1/me` via Identity client
- [x] Frontend Telegram bridge + auth panel (no initDataUnsafe)
- [x] Tests: invalid/tampered/stale initData + session mapping unit tests
- [x] typecheck / test / build / lint verified

## Phase 3 checklist
- [x] Admin DB models (AdminUser, sessions, RBAC, TOTP, recovery, WebAuthn, audit, privileged actions)
- [x] Migration `20251118120000_phase3_admin_auth` (+ seeded roles/permissions)
- [x] Separate admin cookies (`dc_admin_*`) and CORS for `ADMIN_ORIGIN`
- [x] Login: argon2 password + TOTP or hashed recovery codes
- [x] Step-up MFA window on sensitive routes
- [x] RBAC deny-by-default guard + `rbac.service.spec.ts`
- [x] Dual approval flow for `GRANT_SUPER_ADMIN`
- [x] Audit events + `GET admin/audit/events`
- [x] WebAuthn register options/verify (RP from `WEBAUTHN_*`)
- [x] CLI `pnpm provision-admin` (no default credentials)
- [x] `frontend-admin` login UI + Identity API client
- [x] typecheck / test / build / lint verified

## Production release gates (not yet authorized)
- [ ] ASVS 5.0 Level 2 assessment
- [ ] OWASP API Top 10 verification
- [x] Admin MFA/RBAC/immutable audit (baseline slice — hardening in Phase 9)
- [ ] SAST/DAST/dependency/container/secret scanning
- [ ] Load/soak/burst tests
- [ ] WAF/DDoS and production network hardening
- [ ] Backup restore and disaster recovery drill
- [ ] Independent penetration test

## Last agent report (Phase 3)

### Summary
Identity service now hosts admin authentication on a separate session plane from Telegram users: email/password with TOTP or one-time recovery codes, optional WebAuthn registration, RBAC with deny-by-default guards, step-up for privileged routes, dual approval for granting `super_admin`, session list/revoke, and append-only audit listing. `frontend-admin` provides a dev login form against Identity. First admin is created only via `pnpm provision-admin`.

### Key endpoints (Identity)
| Area | Endpoint |
|------|----------|
| Auth | `POST /api/v1/admin/auth/login`, `POST .../logout`, `GET .../me` |
| Sessions | `GET/DELETE /api/v1/admin/auth/sessions`, `POST .../step-up` |
| WebAuthn | `POST /api/v1/admin/auth/webauthn/register/options`, `.../verify` |
| Access | `POST /api/v1/admin/access/super-admin/requests`, `POST .../privileged-actions/:id/approve` |
| Audit | `GET /api/v1/admin/audit/events` |

### Commands run (results)
- `pnpm install` — pass (argon2, otplib, simplewebauthn, tsx)
- `pnpm db:generate` — pass
- `pnpm db:migrate` — applied `20251118120000_phase3_admin_auth`
- `pnpm typecheck` — pass
- `pnpm test` — pass (identity: 6 tests incl. RBAC deny-by-default)
- `pnpm lint` — pass (eslint --fix on `backend/services/identity/src/admin`)
- `pnpm build` — pass

### Manual test
1. Ensure `backend/.env` matches `backend/.env.example` (dual DB URLs, `ADMIN_ORIGIN`, `WEBAUTHN_*`).
2. `pnpm dev:infra` if DB/Redis not running; `pnpm provision-admin -- <email> <password>`.
3. Save printed TOTP secret and recovery codes; open http://localhost:3001 and log in.
4. Optional: register passkey via WebAuthn routes (localhost RP).

### Known limitations
- Admin UI may mirror access token in `sessionStorage` for dev; production should prefer HttpOnly-only patterns.
- WebAuthn login path is registration-focused in this slice; full passkey-only login can extend later.
- Dual approval and step-up require at least two provisioned admins for realistic E2E.
- Legacy keys (`DATABASE_URL`, `ADMIN_TELEGRAM_IDS`, `TELEGRAM_BOT_USERNAME`) are not used by current code.

### Blockers
None for Phase 3 exit criteria.