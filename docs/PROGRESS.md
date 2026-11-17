# Progress

- Current authorized phase: **Phase 2** (completed — Phase 3 locked until user sends `برو بعدی`)
- Status: Phase 2 completed
- Last completed phase: Phase 2 — Identity service and Telegram authentication
- Next phase: Phase 3 — Admin authentication and access control

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

## Production release gates (not yet authorized)
- [ ] ASVS 5.0 Level 2 assessment
- [ ] OWASP API Top 10 verification
- [ ] Admin MFA/RBAC/immutable audit
- [ ] SAST/DAST/dependency/container/secret scanning
- [ ] Load/soak/burst tests
- [ ] WAF/DDoS and production network hardening
- [ ] Backup restore and disaster recovery drill
- [ ] Independent penetration test

## Last agent report (Phase 2)

### Summary
Identity service now owns Telegram login, opaque session/refresh tokens, cookie-based refresh, device session listing/revocation, notification consent flag, and internal token verification. Business API validates Bearer tokens through the Identity internal API. Frontend sends raw `initData` only inside Telegram WebView.

### Key endpoints
| Service | Endpoint |
|---------|----------|
| Identity | `POST /api/v1/auth/telegram` |
| Identity | `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` |
| Identity | `GET /api/v1/auth/me`, `GET/DELETE /api/v1/auth/sessions` |
| Identity | `POST /api/v1/internal/sessions/verify` (internal key) |
| Business API | `GET /api/v1/me` (Bearer access token) |

### Commands run (results)
- `pnpm db:migrate` — applied `20251118010000_phase2_identity_auth`
- `pnpm db:generate` — pass
- `pnpm typecheck` — pass
- `pnpm test` — pass (identity: 5 tests incl. initData HMAC/stale cases)
- `pnpm build` — pass
- `pnpm lint` — pass (after eslint --fix on backend)

### Manual test
1. Set `TELEGRAM_BOT_TOKEN` in `backend/services/identity/.env` (from BotFather).
2. Match `INTERNAL_SERVICE_SECRET` in identity + api `.env`.
3. `pnpm dev` and open Mini App URL inside Telegram (HTTPS tunnel in real test).
4. Tap **ورود با تلگرام** — expect profile + Business `/me` subject.
5. Browser-only visit shows fallback message (no fake auth).

### Known limitations
- Real Telegram login requires bot token + opening app inside Telegram (or tunneled HTTPS).
- Cross-origin cookies work on localhost; production needs `COOKIE_SECURE=true` + trusted origins.
- Refresh-token reuse revokes family in DB; full E2E revocation test needs integration harness.
- Admin login remains Phase 3.

### Blockers
None for Phase 2 exit criteria.