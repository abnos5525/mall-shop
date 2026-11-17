# Admin panel — requirements

## Deployment boundary
- Dedicated Next.js app under `frontend-admin/` with a separate origin such as `admin.example.com`.
- Separate admin session cookie scope; do not share public Mini App browser session.
- Backend remains the authority for every permission check.
- Admin panel never connects directly to either PostgreSQL database.

## Roles
- `super_admin`: full access; protected by passkey/MFA and step-up confirmation.
- `security_admin`: users, sessions, roles (except granting super_admin), security settings and audit.
- `content_manager`: offers, categories, merchants and placements.
- `support_agent`: limited user lookup, status actions allowed by policy; no bulk export.
- `analyst`: aggregated read-only analytics.
- `read_only_auditor`: audit and compliance views only.

Permissions are granular (e.g. `users.read`, `users.suspend`, `users.export`, `offers.publish`, `roles.grant`, `audit.read`, `settings.security.write`). Deny by default.

## Main sections
1. Overview: KPIs, recent events, system health and alerts.
2. Users: search, profile summary, status, sessions, consent, security history, suspend/reinstate, export/delete request workflow.
3. Access control: roles, permissions, assignments and pending approvals.
4. Offers: create/edit/publish/archive, expiry and source verification.
5. Categories and merchants/partners.
6. Affiliate: approved destinations, click analytics and reconciliation notes; no false attribution of sales.
7. Demand requests: review, status, consent-aware lead forwarding.
8. Campaign placements: sponsored labels, scheduling and performance.
9. Analytics: filters, date ranges, aggregated reports and audited exports.
10. Audit & security: admin activity, login failures, MFA events, session revocations, suspicious activity.
11. System operations: feature flags, maintenance mode, queue status, rate-limit controls, service health.
12. Settings: safe configurable product settings; secrets remain in secret manager, never editable/displayed as plaintext in UI.

## High-risk workflow
- Step-up authentication for exports, deletion, role grants, security settings and bulk actions.
- Require reason text for sensitive actions.
- Dual approval for granting/revoking super_admin or changing critical security controls.
- Show impact preview before bulk operations.
- Append-only audit event with actor, action, target, timestamp, request ID, reason and safe before/after diff.
- Audit logs cannot be edited/deleted through the application.

## Security note
The admin UI is not an authorization boundary. All role and permission checks are enforced in the backend. Never ship a default admin password, hidden route as protection, client-side-only role check, or unrestricted super-admin bootstrap.
