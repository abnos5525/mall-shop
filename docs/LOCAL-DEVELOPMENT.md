# Local development

## Prerequisites
- Node.js 22+
- pnpm 9+
- Docker Desktop (for PostgreSQL and Redis)

## 1) Infrastructure
```bash
pnpm dev:infra
```

Services:
- Identity PostgreSQL: `localhost:5433`
- Business PostgreSQL: `localhost:5434`
- Redis: `localhost:6379`

Migration roles (`identity_migrator`, `business_migrator`) are created only by local Docker init scripts. Do not copy these credentials to production.

## 2) Environment files (two files only)
Copy examples and edit (never commit real `.env` files):
- **Backend (all services + Prisma):** `backend/.env.example` → `backend/.env`
- **Frontend (Next.js):** `/.env.example` → `/.env` or `/.env.local` at the **repo root**

In `backend/.env` set `TELEGRAM_BOT_TOKEN` (from BotFather). `INTERNAL_SERVICE_SECRET` is defined once there for API + Identity.

## 3) Install, generate client, migrate
```bash
pnpm install
pnpm db:generate
pnpm db:migrate
```

## 4) Run apps
```bash
pnpm dev
```

| App | URL |
|-----|-----|
| Mini App frontend | http://localhost:3000 |
| Admin shell | http://localhost:3001 |
| Business API | http://localhost:4000/api/v1/health |
| Identity service | http://localhost:4100/api/v1/health |
| Identity Swagger | http://localhost:4100/api/docs |
| Telegram auth | `POST http://localhost:4100/api/v1/auth/telegram` `{ "initData": "..." }` |
| Worker health | http://localhost:4200/api/v1/health |
| Swagger (API, dev) | http://localhost:4000/api/docs |

## 5) First admin user (Phase 3)
After migrations, provision **one** admin (no default password in repo). TOTP secret and recovery codes are printed once — store them offline.

```bash
pnpm provision-admin -- you@example.com YourStrongPassword
```

Then open http://localhost:3001 and sign in with email/password + TOTP (or a recovery code). Admin API lives on Identity (`ADMIN_ORIGIN` / `WEBAUTHN_*` in `backend/.env`).

## 6) Verification
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Production note
Swagger is disabled unless `SWAGGER_ENABLED=true`. Migrator superuser roles are **local-only**; production must use least-privilege migration roles and private networking.