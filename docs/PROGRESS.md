# Progress

- Current authorized phase: **Phase 5** (completed — Phase 6 locked until user sends `برو بعدی`)
- Status: Phase 5 completed
- Last completed phase: Phase 5 — Affiliate tracking
- Next phase: Phase 6 — Favorites and demand requests

## Phase 1–4 checklists
See git history / prior reports — all complete.

## Phase 5 checklist
- [x] Business DB: `OutboundClick`, `AffiliatePartner`, optional `Offer.partnerId`
- [x] Migration `20251118160000_phase5_affiliate`
- [x] `GET /api/v1/go/:slug` — server-side slug resolve, http/https only, 302 redirect
- [x] Affiliate URL preferred when configured; else direct `destinationUrl`
- [x] Click row: destination kind, redirect host only (no full URL in DB), hashed visitor, optional `subjectId`
- [x] `Idempotency-Key` dedupe + throttle 30/min on `/go`
- [x] Admin: `GET /admin/affiliate/analytics/offers`, per-offer stats, partner list/create
- [x] Public offer detail: `usesAffiliateDestination` + outbound CTA via `/go`
- [x] Admin UI: click counts on offer list
- [x] Tests: `go.service.spec.ts`, URL util
- [x] typecheck / test / build / lint verified

## Production release gates (not yet authorized)
- [ ] ASVS 5.0 Level 2 assessment
- [ ] OWASP API Top 10 verification
- [x] Admin MFA/RBAC/immutable audit (baseline slice)
- [ ] SAST/DAST/dependency/container/secret scanning
- [ ] Load/soak/burst tests
- [ ] WAF/DDoS and production network hardening
- [ ] Backup restore and disaster recovery drill
- [ ] Independent penetration test

## Last agent report (Phase 5)

### Summary
Outbound traffic for published offers now flows through `GET /api/v1/go/:slug`. The API resolves the offer by slug, validates redirect targets (http/https), prefers `affiliateUrl` when set, records an `OutboundClick` event (hostname + hashed visitor, optional logged-in `subjectId`), and returns HTTP 302. No client-supplied redirect URLs. Admin endpoints expose basic click totals (all-time, 7-day, affiliate vs direct). Mini App detail page uses the tracked link with disclosure copy.

### Key endpoints
| Audience | Endpoint |
|----------|----------|
| Public | `GET /api/v1/go/:slug` (optional `Idempotency-Key`, optional Bearer) |
| Admin | `GET /api/v1/admin/affiliate/analytics/offers` |
| Admin | `GET /api/v1/admin/affiliate/analytics/offers/:offerId` |
| Admin | `GET/POST /api/v1/admin/affiliate/partners` |

### Commands run (results)
- `pnpm db:migrate` — applied `20251118160000_phase5_affiliate`
- `pnpm typecheck` — pass
- `pnpm test` — pass (API: 7 tests)
- `pnpm lint` — pass (after eslint --fix on affiliate)
- `pnpm build` — pass

### Manual test
1. Publish an offer with `destinationUrl` (and optional `affiliateUrl`).
2. Open `http://localhost:4000/api/v1/go/<slug>` or tap **رفتن به فروشنده** on offer detail.
3. Admin panel shows updated click counts after refresh.

### Known limitations
- Clicks are not sales or commission; no partner API sync.
- Rate limit is global throttler per IP (in-process), not Redis-backed yet.
- Partner registry is metadata-only; offers do not require `partnerId`.
- No public click analytics export.

### Blockers
None for Phase 5 exit criteria.