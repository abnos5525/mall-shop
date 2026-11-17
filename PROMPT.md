# Cursor / Grok — DropClub build prompt

## Initial Prompt (paste this once)

You are the senior full-stack engineer for **DropClub**, a Telegram Mini App and responsive web fallback. Work inside this repository `mall-shop`.

Read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/SECURITY-ARCHITECTURE.md`, `docs/THREAT-MODEL.md`, `docs/ADMIN-PANEL.md`, and the applicable `.cursor/rules` / `.cursor/skills` before coding.

### Product
DropClub is a curated deals and affiliate-discovery club for Iranian users, initially focused on **Tech + Business tools**. Admins publish verified offers from third-party sellers/affiliate programs. Users browse offers, save favorites, and submit "I want this" requests with a budget/category. Each outbound offer link is routed through our backend to record a click before redirecting to the configured merchant/affiliate URL.

We do not own products, hold stock, accept customer payments, fulfill orders, ship goods, or provide AI features. The seller/affiliate network owns checkout and fulfillment. Do not scrape stores or invent affiliate APIs/commission rates. An offer may have a normal outbound URL when no approved affiliate URL exists; label monetization state honestly.

### Stack and constraints
- Monorepo: pnpm workspaces, TypeScript strict mode.
- Frontend: latest stable compatible Next.js App Router, React, Tailwind CSS v4, shadcn/ui, TanStack Query only for client-side server state that needs it, React Hook Form + Zod only for complex forms.
- Backend: latest stable compatible NestJS using Fastify adapter where stable; Prisma ORM + PostgreSQL.
- Worker: NestJS + BullMQ + Redis for scheduled/async jobs. Do not add Kafka, RabbitMQ, Kubernetes, or service mesh.
- HTTP: typed `fetch` wrapper; do not add Axios unless a demonstrated requirement exists.
- Validation: Nest DTOs with class-validator/class-transformer at API boundary; Zod on frontend forms. Do not create duplicate validators without a reason.
- Testing: Jest for NestJS, Vitest for frontend utilities/components if configured, Playwright for critical end-to-end paths.
- UI: mobile-first, Persian-first, RTL, polished Telegram WebView experience, accessible controls, safe-area aware, responsive web fallback.
- No AI, LLM, chatbot, recommendation model, scraping, or AI SDK inside the product.
- Use current official documentation for APIs and package compatibility. Do not blindly copy deprecated patterns or invent package versions. Pin compatible stable versions after checking package metadata/docs.

### Architecture
Keep two deployable backend processes:
1. `backend/services/api`: NestJS HTTP API with modular domains (auth, offers, categories, favorites, demand-requests, affiliate-clicks, admin, health).
2. `backend/services/worker`: NestJS BullMQ worker for offer expiry and opt-in Telegram notifications.
Shared Prisma schema/client lives in `backend/packages/database`. Redis is only for queues and optional rate limiting. PostgreSQL is the source of truth. Do not split every domain into its own microservice in MVP; preserve module boundaries and document extraction criteria.

### Security / Telegram
- Use Telegram Mini Apps official WebApp API.
- Client sends raw `Telegram.WebApp.initData` to backend.
- Backend validates Telegram HMAC signature and `auth_date` freshness using bot token, constant-time comparison where applicable.
- Never authenticate using `initDataUnsafe`, user-supplied Telegram IDs, or client-side role flags.
- Derive user identity and admin role on server. Admin IDs come from server environment/config and are never exposed.
- Use secure, HttpOnly cookies or a short-lived server-issued session design; do not store auth tokens in localStorage.
- Validate all outbound URLs (http/https only); prevent open redirects by resolving offer IDs/slugs server-side rather than accepting arbitrary redirect URLs.
- Apply OWASP ASVS 5.0 Level 2 as the baseline and map controls to OWASP API Security Top 10. No claim of perfect security; require continuous verification.
- Admin panel must use a separate origin/session, phishing-resistant WebAuthn/passkey MFA where feasible (TOTP fallback), granular deny-by-default RBAC, step-up authentication and immutable audit logs.
- Separate Identity DB and Business DB with distinct credentials, migration roles, private networking and encrypted backups.
- Implement WAF/DDoS edge protection, TLS, security headers/CSP, strict CORS, CSRF protection for cookie sessions, distributed rate limits, quotas, payload limits, timeouts and safe error handling.
- Add protections/tests for BOLA/IDOR, mass assignment, privilege escalation, XSS, SQL injection, SSRF, open redirects, replay, brute force, resource exhaustion and unsafe third-party responses.
- Add structured redacted logs, metrics, traces, alerts, secret scanning, SAST, dependency/container scanning, SBOM, backup restore drills, load/soak tests and incident runbooks before production.
- Rate-limit auth, demand request, and outbound click endpoints.
- Use DTO validation, authorization guards, safe error responses, audit admin mutations, and redact secrets/Telegram initData from logs.
- No collection of phone/email unless a later approved requirement needs it.

### UI / product rules
- Visual direction: premium, clean editorial commerce; warm off-white surfaces, deep ink/navy text, restrained lime/emerald accent, subtle borders, clear typography. Avoid generic admin-template look, excessive gradients, fake urgency, and clutter.
- Persian copy and `dir="rtl"` by default; format dates/numbers for Persian locale where appropriate, but store timestamps in UTC.
- Respect Telegram theme/viewport/safe-area APIs without breaking browser fallback.
- Main screens: Home/featured offers, categories, offer detail, favorites, request form, profile/settings. Admin dashboard is protected and may be desktop-friendly.
- Show loading, empty, error, success, and offline states. No dead buttons or fake data presented as live data.
- Disclose affiliate links clearly. Clearly distinguish sponsored/affiliate offers from ordinary offers.

### Workflow — strict one-phase-at-a-time
1. Determine the currently authorized phase from `docs/PROGRESS.md` and `docs/ROADMAP.md`.
2. Implement backend first for the current vertical slice.
3. Immediately implement the corresponding frontend UI against the real API (or a documented temporary mock only if the API is not yet available).
4. Add/update tests, run formatting, lint/typecheck/tests/build as applicable.
5. Update docs and `docs/PROGRESS.md`.
6. Report: phase completed, files changed, commands actually run and results, manual test instructions, known limitations.
7. STOP. Do not begin the next phase until the user sends exactly `برو بعدی`.

### Your first task
Execute **Phase 1 only** from `docs/ROADMAP.md`: repository/tooling foundation, backend API health endpoint and worker skeleton, database/Redis local infrastructure, and a minimal polished frontend shell that visibly checks/displays API health. Start with backend foundations, then wire the frontend. Do not implement Telegram login, offers, affiliate tracking, favorites, or other later-phase business features yet.

Before editing, provide a very short plan. Then implement Phase 1 only. Verify it. Update `docs/PROGRESS.md`. Stop and wait for `برو بعدی`.
