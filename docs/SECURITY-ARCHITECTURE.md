# Security architecture and production readiness

## Security target and assurance
- Use OWASP ASVS 5.0 Level 2 as the baseline verification target; assess Level 3 controls for high-impact admin actions and sensitive operations where appropriate.
- Map API controls to OWASP API Security Top 10 (2023).
- No claim of "100% secure". Security is verified continuously through tests, reviews, scanning, monitoring, backups and incident exercises.
- Threat model assets, actors, trust boundaries, abuse cases and mitigations before production.

## Trust boundaries and deployables
1. `identity-service`: owns Identity DB and all identity/admin authorization data.
2. `business-api`: owns Business DB and DropClub business domains.
3. `worker`: asynchronous, idempotent jobs; least-privilege credentials.
4. `admin-panel`: separate Next.js app/origin from the public Mini App; all actions are still authorized by backend services.
5. Edge layer: TLS, WAF, DDoS controls, bot/abuse rules, request size limits and routing.

Identity and Business use separate PostgreSQL databases, separate DB users/credentials, separate migrations and backups. No cross-database foreign keys. Use UUID subject IDs and internal service APIs/events. Do not expose internal service endpoints publicly. Internal calls use authenticated service identity (mTLS or short-lived signed service credentials), network restrictions and least privilege.

## Identity database owns
- User identity/profile and Telegram identity mapping.
- User lifecycle/status (active, suspended, deleted, deletion-pending).
- Sessions, refresh-token families, revocation and device/session metadata.
- Roles, permissions, role assignments and admin grants.
- Admin MFA/passkey/WebAuthn credentials and recovery metadata.
- Login/security events, account risk flags and consent records.
- Identity audit trail.
Do not store raw Telegram initData, bot tokens, plaintext passwords, raw recovery codes or raw refresh tokens.

## Business database owns
- Offers, categories, merchants/partners, affiliate destinations.
- Favorites, demand requests, outbound clicks, campaign placements.
- Business audit references and analytics aggregates.
- Store only the minimum user subject UUID needed for ownership/attribution; do not duplicate identity secrets/profile data.

## Authentication and sessions
- Telegram Mini App identity: validate raw initData server-side per official Telegram algorithm; enforce auth_date freshness; constant-time hash comparison; reject replay/stale/tampered payloads. Never trust initDataUnsafe.
- Public users: issue opaque, cryptographically random, short-lived session credentials; store only hashes of refresh/session secrets where applicable; rotate refresh tokens and detect reuse; revoke per device and globally.
- Browser sessions: Secure, HttpOnly, SameSite cookies; CSRF defense for cookie-authenticated mutations; strict Origin/Host validation. Do not store auth tokens in localStorage.
- Admin access: separate admin origin and login flow; require phishing-resistant WebAuthn/passkey MFA where feasible, with TOTP fallback and one-time hashed recovery codes. Telegram login alone is not sufficient for privileged admin access.
- Require step-up re-authentication/MFA for sensitive operations (role changes, exports, deleting users, changing payout/partner configuration, security settings).
- Short admin idle timeout, absolute session lifetime, session rotation, device/session revocation and login notifications.
- Deny by default. Enforce authorization on every request and every object/property/action. Never trust client-side roles.

## Authorization model
- RBAC with granular permissions, not a single `isAdmin` boolean.
- Initial roles: `super_admin`, `security_admin`, `content_manager`, `support_agent`, `analyst`, `read_only_auditor`.
- Separation of duties: content editors cannot change security settings or grant roles; support cannot export all users by default; analysts are read-only and use aggregated/de-identified data.
- High-risk actions require step-up auth and an audit reason.
- Protect against BOLA/IDOR, mass assignment, property-level authorization and function-level authorization.
- Admin actions are checked in backend guards/policies, not only hidden in UI.

## Application/API defenses
- TLS 1.2+ (prefer TLS 1.3) end-to-end; HSTS in production.
- Security headers, strict CSP adapted for Telegram WebView, frame-ancestors allowlist, Referrer-Policy, X-Content-Type-Options and Permissions-Policy.
- CORS allowlist exact origins; no wildcard with credentials.
- CSRF protection for cookie sessions; GET/HEAD never mutate state.
- DTO allowlists, strict schema validation, payload size limits and output serialization.
- Parameterized ORM queries; no raw SQL unless reviewed and parameterized.
- XSS prevention: contextual output encoding, safe rich text allowlist, no unsafe HTML injection.
- SSRF protection: no arbitrary URL fetching; if URL previews are ever added, strict hostname/IP allowlist, block private/link-local/metadata IP ranges, validate redirects and DNS rebinding.
- Open redirect protection: redirects resolve only stored offer IDs/slugs and approved destination URLs.
- File upload (if added later): default deny; MIME sniffing, extension allowlist, size limits, malware scan, randomized object keys, private storage and signed short-lived URLs.
- Rate limits distributed through Redis/edge by IP, user, session and route; stricter controls for auth, search, demand submission, exports and redirects.
- Abuse controls: idempotency keys for sensitive writes, quotas, bot detection/challenge at edge where justified, spam throttles and anomaly alerts.
- Protect against ReDoS, request smuggling, HTTP parameter pollution, oversized JSON, GraphQL abuse (not used), and unsafe deserialization.
- Third-party responses are untrusted; validate them and use strict timeouts/retries/circuit breakers.

## Database security
- Separate database credentials per service and environment.
- Runtime DB users have only required schema/table privileges; migrations use a separate migration role.
- No public database ports in production; private network only.
- TLS to database, encryption at rest provided by infrastructure, encrypted backups.
- Connection pooling for application traffic; bounded pool sizes and query timeouts.
- Index foreign-key/filter/sort columns based on real query plans; avoid N+1; paginate every collection.
- Transactions for invariants; idempotent jobs and unique constraints for duplicate prevention.
- Row-Level Security only where tenant/data isolation needs it; never assume RLS is active without explicit policies and tests.
- Retention policy and deletion workflows; avoid collecting unnecessary personal data.

## Admin panel requirements
- Separate Next.js admin application/origin, not merely a hidden public route.
- MFA/passkeys, granular RBAC, session/device management and step-up auth.
- Overview dashboard: users, active users, offers, clicks, demand requests, partner performance, errors and system health.
- User management: search, status, suspend/unsuspend, sessions revoke, privacy export/deletion workflow, consent history, security events. Sensitive PII is masked by default.
- Roles/permissions management with dual-control approval for super-admin/security-role changes.
- Offer/category/merchant/affiliate management, expiry review and moderation.
- Demand-request review with consent-aware lead sharing.
- Analytics with date range, filters, export permission and audit trail.
- Audit log explorer, security alerts, failed login monitoring and admin session list.
- Feature flags, maintenance mode, rate-limit/abuse controls and operational status.
- All mutations require server-side authorization, reason where high risk, and immutable audit events.
- No direct database access from browser/admin app.

## Infrastructure and availability
- WAF/DDoS protection at edge; origin accessible only through trusted proxy/firewall.
- Secrets manager; no secrets in Git, images, logs, client bundles or CI output. Rotate secrets and document emergency rotation.
- Separate dev/staging/production accounts, networks, credentials and databases.
- Containers run as non-root, read-only filesystem where practical, minimal base images, pinned digests and resource limits.
- Private Redis; ACL/password/TLS; no public exposure; queue payloads contain IDs, not secrets/PII.
- Health/readiness/liveness endpoints; graceful shutdown; bounded retries and circuit breakers.
- Structured logs, metrics, traces, request IDs; redact secrets and personal data.
- Alerts for 5xx, latency, queue backlog, DB saturation, auth anomalies, rate-limit spikes, disk, backup failures and certificate expiry.
- Backups: encrypted automated daily full + point-in-time recovery/WAL where supported; retention policy; off-site copy; periodic restore drills. A backup is not proven until restore is tested.
- Define SLOs, RPO/RTO, capacity targets and incident runbooks before launch.
- Horizontal scale API/worker stateless replicas behind load balancer; shared Redis queue; DB pooler and connection budgets.

## Performance and scale
- Load test with k6 or equivalent before public launch; test expected peak and burst traffic, not just average traffic.
- Establish baseline and capacity thresholds; avoid promises of unlimited users.
- Cache public offer/category reads with explicit TTL and invalidation; never cache private/admin responses in shared caches.
- Cursor pagination for growing event/click tables; bounded page sizes.
- DB indexes validated using EXPLAIN/ANALYZE; query budgets and slow-query monitoring.
- Offload notifications, analytics aggregation and exports to worker queues.
- Protect expensive endpoints with quotas, timeouts and concurrency limits.
- Use CDN for static assets and approved images; optimize image sizes and caching.
- Scale by measured bottlenecks; do not add microservices or replicas without DB/Redis capacity planning.

## CI/CD and supply chain
- Branch protection, required reviews for security-sensitive code, signed commits where feasible.
- CI: formatting, lint, typecheck, unit/integration/E2E tests, dependency audit, secret scan, SAST, container scan, migration check and build.
- Generate SBOM; pin dependencies; automated Dependabot/Renovate-style updates with review.
- Deploy immutable artifacts; staged rollout/canary and rollback plan.
- No direct production migrations from developer laptops; use reviewed migration pipeline and separate migration credentials.

## Security verification gates before production
- Threat model reviewed.
- ASVS 5.0 Level 2 checklist assessed and evidence recorded.
- OWASP API Top 10 tests covered.
- Independent penetration test or qualified external review completed.
- Load/soak/burst tests pass agreed thresholds.
- Backup restore and disaster recovery drill passed.
- Incident response, credential rotation and account recovery procedures rehearsed.
- No unresolved critical/high vulnerabilities; medium risks documented with owners and deadlines.
