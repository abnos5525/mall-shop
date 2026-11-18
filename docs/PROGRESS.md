# Progress

- Current authorized phase: **Phase 6** (completed — Phase 7 locked until user sends `برو بعدی`)
- Status: Phase 6 completed
- Last completed phase: Phase 6 — Favorites and demand requests
- Next phase: Phase 7 — Notifications and worker jobs

## Phase 6 checklist
- [x] Business DB: `Favorite`, `DemandRequest` + migration `20251118170000_phase6_favorites_demand`
- [x] Identity permissions: `demand.read`, `demand.moderate`
- [x] `GET/POST/DELETE /me/favorites` (Bearer user session)
- [x] `POST /demand-requests` with `consent === true`, throttle, 5/day per subject
- [x] `GET /demand-requests/mine`
- [x] Admin: `GET/PATCH /admin/demand-requests` + audit on moderate
- [x] Frontend: favorites page, favorite toggle, demand form on offer detail
- [x] Auth panel stores access token in `sessionStorage` for API calls
- [x] Admin demand moderation panel
- [x] Test: `demand.service.spec.ts` (consent)
- [x] typecheck / test / build / lint verified

## Earlier phases
Phases 1–5 complete (see prior PROGRESS revisions / git history).

## Production release gates (not yet authorized)
Unchanged — see Phase 5 report.

## Last agent report (Phase 6)

### Summary
Logged-in Telegram users can favorite published offers and submit minimal “I want this” demand requests with explicit consent. Favorites and demands are keyed by Identity `subjectId` in the Business DB. Demand creation is rate-limited (HTTP throttle + 5 requests per 24h per user). Admins list and moderate demands with RBAC and audit.

### Key endpoints (Business API)
| Audience | Endpoint |
|----------|----------|
| User | `GET/POST/DELETE /api/v1/me/favorites/:offerId` |
| User | `POST /api/v1/demand-requests`, `GET /api/v1/demand-requests/mine` |
| Admin | `GET /api/v1/admin/demand-requests`, `PATCH .../:id` |

### Commands run (results)
- `pnpm db:migrate` — phase 6 identity + business migrations
- `pnpm typecheck` — pass
- `pnpm test` — pass (API: 8 tests)
- `pnpm lint` — pass
- `pnpm build` — pass

### Manual test
1. Mini App: login with Telegram → open offer → favorite + submit demand with consent checkbox.
2. `/favorites` lists saved offers.
3. Admin: review pending demands → Mark reviewed.

### Known limitations
- User access token in `sessionStorage` is dev-oriented; HttpOnly-only hardening deferred.
- Favorite button does not preload “already saved” state on page load.
- No user notification when demand is reviewed (Phase 7).

### Blockers
None for Phase 6 exit criteria.