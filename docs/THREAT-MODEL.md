# Threat model (initial)

## Assets
Telegram identity, user sessions, admin privileges, identity DB, business DB, affiliate destinations, demand-request data, partner credentials, audit logs and service availability.

## Threat actors
Unauthenticated internet users, malicious authenticated users, compromised user accounts, malicious insiders, compromised dependencies, bot traffic and third-party integration compromise.

## High-priority threats and controls
- Account spoofing/replay: Telegram HMAC validation, auth_date freshness, nonce/session rotation and replay tests.
- Admin takeover: separate admin origin, WebAuthn/passkey MFA, step-up checks, short sessions, login anomaly alerts.
- BOLA/IDOR: object-level authorization on every read/write, negative tests with two users.
- Privilege escalation: deny-by-default RBAC, server-side permission guards, dual approval for super-admin.
- SQL injection: Prisma parameterization, no unsafe raw SQL, validation and DB least privilege.
- XSS: output encoding, CSP, safe content rendering and dependency review.
- CSRF: secure cookie policy, origin validation and CSRF protection for state-changing browser requests.
- SSRF/open redirect: no arbitrary fetch/redirect URL; allowlisted stored destinations.
- Brute force/credential stuffing: distributed throttles, MFA, anomaly alerts and edge controls.
- Resource exhaustion: request limits, bounded pagination, timeouts, quotas, queue backpressure and load tests.
- Data breach: database separation, private networking, least-privilege credentials, encryption, masking and audit.
- Insider misuse: role separation, step-up, dual control and append-only audit.
- Supply-chain compromise: lockfile, dependency scanning, SBOM, image scanning and staged deployment.
- Data loss/ransomware: encrypted off-site backups, PITR where available and restore drills.
- DDoS: managed edge WAF/DDoS protection, origin firewall and graceful degradation.

## Required negative tests
Attempt cross-user object access, admin-only routes as normal user, mass assignment of role/status, stale/tampered Telegram initData, refresh-token reuse, CSRF from hostile origin, redirect to attacker URL, SSRF to localhost/private IP, oversized payloads, rate-limit bypass across replicas, and duplicate/replayed jobs.
