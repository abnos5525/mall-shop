# Progress

- Current authorized phase: **Phase 4** (completed — Phase 5 locked until user sends `برو بعدی`)
- Status: Phase 4 completed
- Last completed phase: Phase 4 — Offers and categories
- Next phase: Phase 5 — Affiliate tracking

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

## Phase 4 checklist
- [x] Business DB: `Category`, `Offer` models + migration `20251118140000_phase4_offers` (seed categories)
- [x] Identity migration `20251118150000_phase4_offer_permissions`
- [x] Internal admin verify + audit relay (`POST internal/admin/sessions/verify`, `.../audit/events`)
- [x] Public API: `GET /categories`, `GET /offers`, `GET /offers/:slug` (cursor pagination, expiry filter)
- [x] Admin API: CRUD categories, create/update/publish/archive offers + RBAC + audit
- [x] Public read cache TTL ~60s with invalidation on admin writes
- [x] URL validation (http/https only) + unit test
- [x] Contracts types (`PublicOffer*`, `ADMIN_PERMISSIONS`)
- [x] Frontend: home featured, `/categories`, `/offers`, `/offers/[slug]`
- [x] `frontend-admin`: draft create + publish panel (Bearer to Business API)
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

## Last agent report (Phase 4)

### Summary
Business API now owns offers and categories in the Business DB. Public routes return only published, non-expired offers with cursor pagination and short-lived in-process cache. Admin routes verify Bearer admin tokens through Identity internal verify, enforce `offers.*` / `categories.write` permissions, and record audit events back to Identity. Mini App lists categories and offers; admin UI can create a draft in `tech` and publish it.

### Key endpoints (Business API)
| Audience | Endpoint |
|----------|----------|
| Public | `GET /api/v1/categories` |
| Public | `GET /api/v1/offers`, `GET /api/v1/offers/:slug` |
| Admin | `GET/POST /api/v1/admin/offers`, `PATCH .../:id`, `POST .../:id/publish`, `POST .../:id/archive` |
| Admin | `GET/POST /api/v1/admin/categories`, `PATCH .../:id` |

### Key endpoints (Identity — internal)
| Endpoint |
|----------|
| `POST /api/v1/internal/admin/sessions/verify` |
| `POST /api/v1/internal/admin/audit/events` |

### Commands run (results)
- `pnpm db:generate` — pass
- `pnpm db:migrate` — applied `20251118140000_phase4_offers`, `20251118150000_phase4_offer_permissions`
- `pnpm typecheck` — pass (after `contracts` build)
- `pnpm test` — pass (API: 5 tests incl. URL guard)
- `pnpm lint` — pass
- `pnpm build` — pass

### Manual test
1. `pnpm dev:infra` + `pnpm dev`.
2. Admin: log in at http://localhost:3001, create draft offer, publish.
3. Mini App: http://localhost:3000 — home / categories / offer detail.
4. Swagger: http://localhost:4000/api/docs

### Known limitations
- Outbound merchant links are not exposed on the public detail page yet (Phase 5 `/go/:slug`).
- Public cache is per API process (not shared Redis).
- Admin offer form is minimal dev UI (fixed `categoryId: tech`).
- Admins created before permission migration inherit new grants via `super_admin` role seed only if role assignment exists.

### Blockers
None for Phase 4 exit criteria.