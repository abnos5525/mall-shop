# Local development (Phase 1)

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

## 2) Environment files
Copy each `.env.example` to `.env` (never commit `.env`):
- `backend/packages/database/.env`
- `backend/services/api/.env`
- `backend/services/identity/.env`
- `backend/services/worker/.env`
- `frontend/.env.local` from `frontend/.env.example`

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
| Worker health | http://localhost:4200/api/v1/health |
| Swagger (API, dev) | http://localhost:4000/api/docs |

## 5) Verification
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Production note
Swagger is disabled unless `SWAGGER_ENABLED=true`. Migrator superuser roles are **local-only**; production must use least-privilege migration roles and private networking.